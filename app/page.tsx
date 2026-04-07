"use client";

import { useEffect } from "react";
import { Character, Episode, Location, ResourceType } from "@/types/api";
import { generateCodeSnippet } from "@/lib/api";
import { useExplorerStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { MenuIcon, XIcon } from "lucide-react";

const SPECIES_OPTIONS = [
  "Human", "Alien", "Robot", "Mythological Creature", "Animal",
  "Cronenberg", "Disease", "Humanoid", "Poopybutthole", "unknown",
];

function StatusDot({ status }: { status: string }) {
  const color = status === "Alive" ? "bg-green-500" : status === "Dead" ? "bg-red-500" : "bg-gray-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="rounded-lg border bg-black overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-zinc-900 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500">{language}</span>
      </div>
      <ScrollArea className="max-h-64">
        <pre className="p-4 text-xs text-zinc-300 overflow-x-auto"><code>{code}</code></pre>
      </ScrollArea>
    </div>
  );
}

function JsonView({ data }: { data: object }) {
  return (
    <div className="rounded-lg border bg-black overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-zinc-900 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500">response.json</span>
      </div>
      <ScrollArea className="max-h-96">
        <pre className="p-4 text-xs text-zinc-300 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
}

function CharacterCard({ character, selected, onClick }: { character: Character; selected: boolean; onClick: () => void }) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-colors ${selected ? "border-green-500 ring-1 ring-green-500" : "hover:border-zinc-500"}`}
      onClick={onClick}
    >
      <div className="relative aspect-square bg-zinc-900">
        <img src={character.image} alt={character.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-2">
        <h3 className="font-semibold text-sm text-white truncate">{character.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <StatusDot status={character.status} />
          <span className="text-xs text-zinc-500">{character.status}</span>
        </div>
      </div>
    </Card>
  );
}

function CharacterDetail({ character }: { character: Character }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
      <img src={character.image} alt={character.name} className="w-full rounded-lg object-cover aspect-square" />
      <div>
        <h2 className="text-xl font-bold text-white mb-3">{character.name}</h2>
        <div className="space-y-2 text-sm">
          {[
            ["Status", <Badge key="s" variant={character.status === "Alive" ? "default" : character.status === "Dead" ? "destructive" : "secondary"} className="flex items-center gap-1"><StatusDot status={character.status} />{character.status}</Badge>],
            ["Species", character.species],
            ["Type", character.type || "N/A"],
            ["Gender", character.gender],
            ["Origin", character.origin.name],
            ["Location", character.location.name],
            ["Episodes", `${character.episode?.length ?? 0} total`],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between py-1 border-b border-zinc-800">
              <span className="text-zinc-500">{label}</span>
              <span className="text-zinc-300 truncate max-w-48">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {character.episode?.slice(0, 6).map((ep) => (
            <Badge key={ep} variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10">EP {ep.split("/").pop()}</Badge>
          ))}
          {(character.episode?.length ?? 0) > 6 && (
            <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10">+{(character.episode?.length ?? 0) - 6}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function LocationRow({ location }: { location: Location }) {
  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
      <td className="py-2 px-3 text-zinc-500">{location.id}</td>
      <td className="py-2 px-3 font-semibold text-white">{location.name}</td>
      <td className="py-2 px-3 text-zinc-400">{location.type || "—"}</td>
      <td className="py-2 px-3 text-zinc-500">{location.dimension || "—"}</td>
      <td className="py-2 px-3"><Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">{location.residents?.length ?? 0}</Badge></td>
    </tr>
  );
}

function EpisodeRow({ episode }: { episode: Episode }) {
  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
      <td className="py-2 px-3"><Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10">{episode.episode}</Badge></td>
      <td className="py-2 px-3 font-semibold text-white">{episode.name}</td>
      <td className="py-2 px-3 text-zinc-500">{episode.air_date}</td>
      <td className="py-2 px-3 text-green-400">{episode.characters?.length ?? 0}</td>
    </tr>
  );
}

export default function RickMortyExplorer() {
  const {
    sidebarOpen, setSidebarOpen,
    activeTab, setActiveTab,
    selectedCharacter, setSelectedCharacter,
    resource, setResource,
    filters, setFilters,
    page, totalPages,
    loading, data, error,
    url,
    fetch: doFetch,
    fetchPage,
  } = useExplorerStore();

  // Load default results on first mount
  useEffect(() => { doFetch(); }, []);

  const handleResourceChange = (r: ResourceType) => {
    setResource(r);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setActiveTab("detail");
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 border-r border-zinc-800/50 bg-zinc-950 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:z-auto`}>
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <div>
            <div className="font-[family-name:var(--font-orbitron)] font-bold text-green-500 tracking-wider text-sm">R&amp;M API</div>
            <div className="text-[10px] text-zinc-600 tracking-widest uppercase mt-1">Live Explorer</div>
          </div>
          <button className="md:hidden text-zinc-500 hover:text-zinc-300" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-xs text-zinc-600 tracking-widest uppercase mb-2">Resources</div>
          <nav className="space-y-1">
            {(["character", "location", "episode"] as ResourceType[]).map((r) => (
              <button
                key={r}
                onClick={() => handleResourceChange(r)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${resource === r ? "bg-green-500/10 text-green-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${resource === r ? "bg-green-500" : "bg-zinc-600"}`} />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800 flex-1 flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-600 tracking-widest uppercase mb-1 block">Search</label>
            <Input
              placeholder="Search by name..."
              value={filters.name || ""}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && doFetch()}
              className="bg-zinc-900 border-zinc-800 text-sm"
            />
          </div>

          {resource === "character" && (
            <>
              <div>
                <label className="text-xs text-zinc-600 tracking-widest uppercase mb-1 block">Status</label>
                <select
                  value={filters.status || "all"}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value === "all" ? undefined : e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All statuses</option>
                  <option value="Alive">Alive</option>
                  <option value="Dead">Dead</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-600 tracking-widest uppercase mb-1 block">Species</label>
                <select
                  value={filters.species || "all"}
                  onChange={(e) => setFilters((f) => ({ ...f, species: e.target.value === "all" ? undefined : e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All species</option>
                  {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          <Button onClick={doFetch} disabled={loading} className="mt-2 bg-green-500 hover:bg-green-600 text-black font-[family-name:var(--font-orbitron)] font-bold text-xs uppercase tracking-wider">
            {loading ? "Loading..." : "Fetch →"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <button className="md:hidden text-zinc-500 hover:text-zinc-300 mr-1" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <MenuIcon className="size-5" />
          </button>
          <span className="text-xs text-zinc-600">GET</span>
          <code className="text-xs bg-zinc-900 border border-green-500/30 rounded px-2 py-1 text-green-500 font-mono truncate max-w-xs sm:max-w-none">{url}</code>
          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            live
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ui" | "json" | "code" | "detail")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="border-b border-zinc-800 rounded-none bg-transparent h-auto p-0">
            {(["ui", "json", "code"] as const).map((t) => (
              <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500 data-[state=active]:bg-transparent text-zinc-500 px-4 py-2.5 text-sm capitalize">
                {t === "ui" ? "UI View" : t === "json" ? "JSON" : "Code"}
              </TabsTrigger>
            ))}
            {selectedCharacter && (
              <TabsTrigger value="detail" className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500 data-[state=active]:bg-transparent text-zinc-500 px-4 py-2.5 text-sm">
                Detail
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ui" className="flex-1 overflow-auto p-4 m-0">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-400 text-sm mb-4">{error}</div>}

            {!loading && data && data.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-2 text-green-400 text-xs mb-4">
                Found {data.length} results
              </div>
            )}

            {/* Character skeletons / cards */}
            {resource === "character" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {loading
                  ? Array.from({ length: 20 }).map((_, i) => <CharacterCardSkeleton key={i} />)
                  : (data as Character[] | null)?.map((item) => (
                      <CharacterCard
                        key={item.id}
                        character={item}
                        selected={selectedCharacter?.id === item.id}
                        onClick={() => handleCharacterSelect(item)}
                      />
                    ))}
              </div>
            )}

            {/* Location skeletons / rows */}
            {resource === "location" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
                      {["#", "Name", "Type", "Dimension", "Residents"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                      : (data as Location[] | null)?.map((item) => <LocationRow key={item.id} location={item} />)}
                  </tbody>
                </table>
              </div>
            )}

            {/* Episode skeletons / rows */}
            {resource === "episode" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
                      {["Code", "Name", "Air Date", "Characters"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                      : (data as Episode[] | null)?.map((item) => <EpisodeRow key={item.id} episode={item} />)}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && (!data || data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <span className="text-4xl opacity-30">⚡</span>
                <span className="mt-2">No results found</span>
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => fetchPage(Math.max(1, page - 1))} disabled={page <= 1}>← Prev</Button>
                <span className="text-xs text-zinc-500">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => fetchPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next →</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="json" className="flex-1 overflow-auto p-4 m-0">
            {data && <JsonView data={data} />}
          </TabsContent>

          <TabsContent value="code" className="flex-1 overflow-auto p-4 m-0">
            <div className="space-y-4">
              {generateCodeSnippet(url).map((s) => <CodeBlock key={s.language} language={s.language} code={s.code} />)}
            </div>
          </TabsContent>

          {selectedCharacter && (
            <TabsContent value="detail" className="flex-1 overflow-auto p-4 m-0">
              <CharacterDetail character={selectedCharacter} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
