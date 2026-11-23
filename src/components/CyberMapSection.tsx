import { useCallback, useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Compass, ExternalLink, Loader2, MapPin, Navigation, Search } from 'lucide-react';
import type { Lang } from '../data/cyberData';

interface CyberMapSectionProps {
  lang: Lang;
}

interface DiscoveredPlace {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  googleMapsUri: string;
  rating?: number;
  userRatingCount?: number;
}

interface GroundedMapLink {
  title: string;
  uri: string;
  placeId?: string;
  snippets?: { text: string; uri: string; author: string }[];
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi default camera center

function PlaceMarkerItem({
  place,
  selected,
  onSelect,
}: {
  place: DiscoveredPlace;
  selected: boolean;
  onSelect: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        title={place.name}
        onClick={onSelect}
      >
        <Pin
          background={selected ? '#0284c7' : '#0f172a'}
          borderColor="#ffffff"
          glyphColor="#ffffff"
          scale={selected ? 1.2 : 1.0}
        />
      </AdvancedMarker>

      {selected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onSelect}>
          <div className="p-1 text-slate-900">
            <p className="text-xs font-bold leading-snug">{place.name}</p>
            <p className="mt-1 text-[11px] text-slate-600 leading-snug">{place.address}</p>
            {place.rating !== undefined && (
              <p className="mt-1 text-[11px] font-medium text-amber-700">
                ★ {place.rating.toFixed(1)} ({place.userRatingCount ?? 0})
              </p>
            )}
            {place.googleMapsUri && (
              <a
                href={place.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 underline"
              >
                Open in Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function InteractivePlacesController({
  searchQuery,
  center,
  lang,
  onResults,
  onError,
  onLoadingChange,
}: {
  searchQuery: string;
  center: { lat: number; lng: number };
  lang: Lang;
  onResults: (places: DiscoveredPlace[]) => void;
  onError: (msg: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);

  useEffect(() => {
    if (!placesLib || !searchQuery.trim()) return;
    let cancelled = false;

    const runSearch = async () => {
      onLoadingChange(true);
      onError(null);
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: searchQuery.trim(),
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'googleMapsURI',
            'rating',
            'userRatingCount',
          ],
          locationBias: center,
          maxResultCount: 8,
          language: lang,
          region: 'IN',
        });

        if (cancelled) return;
        interface GooglePlaceRecord {
          id?: string;
          displayName?: string | null;
          formattedAddress?: string | null;
          location?: { lat: () => number; lng: () => number } | null;
          googleMapsURI?: string | null;
          rating?: number | null;
          userRatingCount?: number | null;
        }

        const placeList = (places || []) as GooglePlaceRecord[];
        const mapped: DiscoveredPlace[] = placeList
          .filter((p: GooglePlaceRecord) => Boolean(p.location))
          .map((p: GooglePlaceRecord, idx: number) => ({
            id: p.id || `place-${idx}`,
            name: p.displayName || 'Cyber Help Location',
            address: p.formattedAddress || '',
            location: {
              lat: p.location!.lat(),
              lng: p.location!.lng(),
            },
            googleMapsUri: p.googleMapsURI || '',
            rating: typeof p.rating === 'number' ? p.rating : undefined,
            userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
          }));

        onResults(mapped);
        if (mapped[0] && map) {
          map.panTo(mapped[0].location);
          map.setZoom(13);
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to load Google Maps Places results. Please check your network or API configuration.';
        onError(msg);
      } finally {
        if (!cancelled) onLoadingChange(false);
      }
    };

    void runSearch();
    return () => {
      cancelled = true;
    };
  }, [placesLib, searchQuery, center, lang, map, onResults, onError, onLoadingChange]);

  return null;
}

export function CyberMapSection({ lang }: CyberMapSectionProps) {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const hasMapsJsKey = Boolean(mapsApiKey && mapsApiKey.trim() && mapsApiKey !== 'MY_GOOGLE_MAPS_API_KEY');

  const [cityQuery, setCityQuery] = useState('Cyber Crime Police Station Delhi');
  const [submittedQuery, setSubmittedQuery] = useState('Cyber Crime Police Station Delhi');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  // Places API (New) results
  const [places, setPlaces] = useState<DiscoveredPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Gemini Google Maps Grounding results
  const [groundedLoading, setGroundedLoading] = useState(false);
  const [groundedText, setGroundedText] = useState<string | null>(null);
  const [groundedLinks, setGroundedLinks] = useState<GroundedMapLink[]>([]);
  const [groundedError, setGroundedError] = useState<string | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus(
        lang === 'en'
          ? 'Geolocation is not supported by your browser.'
          : 'आपके ब्राउज़र में लोकेशन सुविधा उपलब्ध नहीं है।',
      );
      return;
    }
    setGeoStatus(lang === 'en' ? 'Detecting your coordinates...' : 'आपकी लोकेशन प्राप्त की जा रही है...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setMapCenter({ lat: coords.latitude, lng: coords.longitude });
        setGeoStatus(
          lang === 'en'
            ? `Location set (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`
            : `लोकेशन सेट (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`,
        );
      },
      () => {
        setGeoStatus(
          lang === 'en'
            ? 'Location permission denied. Search by city name instead.'
            : 'लोकेशन अनुमति नहीं मिली। कृपया शहर का नाम लिखकर खोजें।',
        );
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const handleSearchMapsGrounding = useCallback(
    async (queryToRun: string) => {
      if (!queryToRun.trim()) return;
      setSubmittedQuery(queryToRun.trim());
      setGroundedLoading(true);
      setGroundedError(null);
      try {
        const resp = await fetch('/api/cyber-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                text: `Find verified official locations and help centers for: ${queryToRun.trim()}`,
              },
            ],
            mode: 'maps',
            lang,
            ...(userCoords ? { location: userCoords } : {}),
          }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Unable to query Google Maps grounding.');
        }
        setGroundedText(data.reply || '');
        setGroundedLinks(Array.isArray(data.mapSources) ? data.mapSources : []);
      } catch (err) {
        setGroundedError(
          err instanceof Error ? err.message : 'Unable to fetch grounded Maps places.',
        );
      } finally {
        setGroundedLoading(false);
      }
    },
    [lang, userCoords],
  );

  return (
    <section id="locator" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Google Maps Platform · Cyber Help Locator'
                  : 'Google Maps · नजदीकी साइबर सहायता केंद्र'}
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en'
                ? 'Find Nearby Cyber Crime Police Stations'
                : 'नजदीकी साइबर क्राइम पुलिस स्टेशन खोजें'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Search official police stations and cyber crime reporting cells using live Google Maps data and location grounding.'
                : 'लाइव Google Maps डेटा की मदद से अपने शहर या आस-पास के साइबर क्राइम पुलिस स्टेशन की जानकारी और दिशा देखें।'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Navigation className="h-3.5 w-3.5 text-sky-700" />
            <span>{lang === 'en' ? 'Use My Location' : 'मेरी लोकेशन इस्तेमाल करें'}</span>
          </button>
        </div>

        {/* Search Toolbar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSearchMapsGrounding(cityQuery);
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'e.g. Cyber Crime Police Station Dheerpur Delhi or Mumbai'
                  : 'जैसे: Cyber Crime Police Station Delhi या अपना शहर लिखें...'
              }
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>
          <button
            type="submit"
            disabled={groundedLoading || placesLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {(groundedLoading || placesLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{lang === 'en' ? 'Search Google Maps' : 'Google Maps पर खोजें'}</span>
          </button>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>{lang === 'en' ? 'Quick city searches:' : 'त्वरित खोज:'}</span>
          {[
            'Cyber Crime Police Station New Delhi',
            'Cyber Crime Police Station Dheerpur Delhi',
            'Cyber Crime Police Station Mumbai',
            'Cyber Crime Police Station Bengaluru',
          ].map((presetQuery) => (
            <button
              key={presetQuery}
              type="button"
              onClick={() => {
                setCityQuery(presetQuery);
                void handleSearchMapsGrounding(presetQuery);
              }}
              className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {presetQuery.replace('Cyber Crime Police Station ', '')}
            </button>
          ))}
          {geoStatus && <span className="ml-auto font-medium text-sky-800">{geoStatus}</span>}
        </div>

        {/* Two-column Map + Grounded Place Directory */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Interactive @vis.gl/react-google-maps Viewport */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {hasMapsJsKey ? (
                <div className="h-[420px] w-full">
                  <APIProvider
                    apiKey={mapsApiKey!}
                    libraries={['places', 'marker']}
                    language={lang}
                    region="IN"
                  >
                    <GoogleMap
                      mapId="DEMO_MAP_ID"
                      defaultZoom={12}
                      defaultCenter={DEFAULT_CENTER}
                      gestureHandling="cooperative"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                      onClick={() => setSelectedPlaceId(null)}
                    >
                      <InteractivePlacesController
                        searchQuery={submittedQuery}
                        center={mapCenter}
                        lang={lang}
                        onResults={setPlaces}
                        onError={setPlacesError}
                        onLoadingChange={setPlacesLoading}
                      />

                      {places.map((pl) => (
                        <PlaceMarkerItem
                          key={pl.id}
                          place={pl}
                          selected={pl.id === selectedPlaceId}
                          onSelect={() =>
                            setSelectedPlaceId((prev) => (prev === pl.id ? null : pl.id))
                          }
                        />
                      ))}
                    </GoogleMap>
                  </APIProvider>
                </div>
              ) : (
                <div className="flex h-[420px] flex-col items-center justify-center bg-slate-900 p-8 text-center text-white">
                  <Compass className="h-10 w-10 text-sky-400" />
                  <h3 className="mt-4 text-base font-bold">
                    {lang === 'en'
                      ? 'Interactive Map Preview & Live Grounding'
                      : 'इंटरैक्टिव मैप और लाइव लोकेशन जांच'}
                  </h3>
                  <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                    {lang === 'en'
                      ? 'Click "Search Google Maps" above to fetch verified Cyber Crime Police Stations and direct Google Maps links using Gemini Google Maps Grounding. Interactive map tiles activate automatically when a Maps JavaScript key is attached.'
                      : 'नजदीकी साइबर पुलिस स्टेशनों के असली Google Maps लिंक देखने के लिए ऊपर "Google Maps पर खोजें" दबाएं। Maps JavaScript की जुड़ने पर लाइव इंटरैक्टिव मैप भी खुल जाएगा।'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleSearchMapsGrounding(cityQuery)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {lang === 'en'
                        ? 'Fetch Grounded Cyber Help Centers'
                        : 'नजदीकी साइबर सहायता केंद्र खोजें'}
                    </span>
                  </button>
                </div>
              )}

              {placesError && (
                <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
                  {placesError}
                </div>
              )}
            </div>
          </div>

          {/* Right: Verified Places & Google Maps Grounding Links */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                {lang === 'en' ? 'Verified Maps Results' : 'सत्यापित Google Maps परिणाम'}
              </h3>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {places.length > 0 ? places.length : groundedLinks.length}{' '}
                {lang === 'en' ? 'places' : 'स्थान'}
              </span>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {places.length > 0 &&
                places.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaceId(pl.id)}
                    className={`rounded-lg border p-3.5 transition-colors cursor-pointer ${
                      selectedPlaceId === pl.id
                        ? 'border-sky-500 bg-sky-50/70'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-950">{pl.name}</p>
                    <p className="mt-1 text-xs text-slate-600">{pl.address}</p>
                    {pl.googleMapsUri && (
                      <a
                        href={pl.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
                      >
                        {lang === 'en' ? 'Directions on Google Maps' : 'Google Maps पर रास्ता देखें'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}

              {groundedError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                  {groundedError}
                </div>
              )}

              {groundedText && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                  {groundedText}
                </div>
              )}

              {groundedLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {lang === 'en'
                      ? 'Google Maps Place Sources:'
                      : 'Google Maps स्रोत लिंक:'}
                  </p>
                  {groundedLinks.map((src, idx) => (
                    <div
                      key={`${src.uri}-${idx}`}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">{src.title}</span>
                        {src.uri && (
                          <a
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline shrink-0"
                          >
                            Maps
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {src.snippets && src.snippets.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          {src.snippets.map((sn, sIdx) =>
                            sn.uri ? (
                              <a
                                key={sIdx}
                                href={sn.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-sky-700 underline mr-3"
                              >
                                {sn.author || 'Review snippet'}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ) : null,
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {places.length === 0 && !groundedText && !groundedError && (
                <p className="py-8 text-center text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Enter your city or click "Search Google Maps" to retrieve verified Cyber Crime Police Stations and clickable Google Maps links.'
                    : 'सत्यापित साइबर पुलिस स्टेशन और Google Maps लिंक देखने के लिए ऊपर अपने शहर का नाम लिखकर खोजें।'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
