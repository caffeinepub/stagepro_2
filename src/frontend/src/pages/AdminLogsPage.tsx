import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowLeft,
  Bookmark,
  Clock,
  Database,
  ImageOff,
  Key,
  Layers,
  Save,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AiGenerationLog {
  id: bigint;
  createdAt: bigint;
  inputImageBlobId: string;
  userPrincipal: { toString(): string };
  prompt: string;
  outputImageBlobId: string;
}

interface StarredEntry {
  id: bigint;
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
  createdAt: bigint;
  updatedAt: bigint;
  userPrincipal: { toString(): string };
}

type TabId = "logs" | "bookmarks" | "activity" | "timeline";

interface AdminLogsPageProps {
  onBack: () => void;
  actor: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}…${principal.slice(-6)}`;
}

function truncateText(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function ImageThumb({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src)
    return <span style={{ color: "#9A9A9A", fontSize: "0.75rem" }}>—</span>;
  if (error)
    return (
      <div
        className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#EEE7DA" }}
      >
        <ImageOff className="w-4 h-4" style={{ color: "#9A9A9A" }} />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 object-cover rounded flex-shrink-0"
      style={{ border: "1px solid #DDD6C8" }}
      onError={() => setError(true)}
    />
  );
}

function PrincipalBadge({ principal }: { principal: string }) {
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded whitespace-nowrap"
      style={{ backgroundColor: "#EEE7DA", color: "#4A4A4A" }}
      title={principal}
    >
      {truncatePrincipal(principal)}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accent}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: "#7A7A7A" }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function TabButton({
  id,
  label,
  icon: Icon,
  active,
  count,
  onClick,
}: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`admin_tabs.${id}.button`}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
      style={
        active
          ? { backgroundColor: "#6F9D79", color: "#fff" }
          : {
              backgroundColor: "#FFFFFF",
              color: "#5A5A5A",
              border: "1px solid #DDD6C8",
            }
      }
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {count !== undefined && count > 0 && (
        <span
          className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
          style={
            active
              ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
              : { backgroundColor: "#D9EFE1", color: "#4A7D5A" }
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  ocid,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  ocid?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
      data-ocid={ocid}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "#EEE7DA" }}
      >
        <Icon className="w-8 h-8" style={{ color: "#6F9D79" }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A1A" }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs mx-auto" style={{ color: "#7A7A7A" }}>
        {subtitle}
      </p>
    </motion.div>
  );
}

function LoadingRows({ cols = 6 }: { cols?: number }) {
  return (
    <div className="space-y-3" data-ocid="admin.loading_state">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
        >
          {Array.from({ length: cols }, (_, j) => `sk-${j}`).map((key, j) => (
            <Skeleton
              key={key}
              className={`h-4 rounded ${j === 2 ? "flex-1" : j === 3 || j === 4 ? "w-12 h-12" : "w-24"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Generation Logs ─────────────────────────────────────────────────────

function GenerationLogsTab({ logs }: { logs: AiGenerationLog[] }) {
  if (logs.length === 0)
    return (
      <EmptyState
        icon={Database}
        title="No generation logs yet"
        subtitle="AI generation logs will appear here once users start generating designs."
        ocid="admin.logs.empty"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Desktop table */}
      <div
        className="hidden md:block rounded-2xl overflow-hidden"
        style={{ border: "1px solid #DDD6C8" }}
        data-ocid="admin.logs.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#EEE7DA" }}>
              {["#", "User", "Prompt", "Input", "Output", "Time"].map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#7A7A7A" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr
                key={String(log.id)}
                className="border-t hover:opacity-95 transition-opacity"
                style={{
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAF8F4",
                  borderColor: "#DDD6C8",
                }}
                data-ocid={`admin.logs.row.${idx + 1}`}
              >
                <td
                  className="px-4 py-3 font-mono text-xs"
                  style={{ color: "#9A9A9A" }}
                >
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <PrincipalBadge principal={log.userPrincipal.toString()} />
                </td>
                <td
                  className="px-4 py-3 max-w-xs"
                  style={{ color: "#3A3A3A" }}
                  title={log.prompt}
                >
                  {truncateText(log.prompt)}
                </td>
                <td className="px-4 py-3">
                  <ImageThumb src={log.inputImageBlobId} alt="Input" />
                </td>
                <td className="px-4 py-3">
                  <ImageThumb src={log.outputImageBlobId} alt="Output" />
                </td>
                <td
                  className="px-4 py-3 text-xs whitespace-nowrap"
                  style={{ color: "#7A7A7A" }}
                >
                  {formatTimestamp(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {logs.map((log, idx) => (
          <motion.div
            key={String(log.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
            data-ocid={`admin.logs.card.${idx + 1}`}
          >
            <div className="flex items-center justify-between gap-2">
              <PrincipalBadge principal={log.userPrincipal.toString()} />
              <span className="text-xs" style={{ color: "#9A9A9A" }}>
                {formatTimestamp(log.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#3A3A3A" }}>
              {truncateText(log.prompt)}
            </p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: "#9A9A9A" }}>
                  Input
                </p>
                <ImageThumb src={log.inputImageBlobId} alt="Input" />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "#9A9A9A" }}>
                  Output
                </p>
                <ImageThumb src={log.outputImageBlobId} alt="Output" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Tab: Bookmark History ────────────────────────────────────────────────────

function BookmarkHistoryTab({ entries }: { entries: StarredEntry[] }) {
  if (entries.length === 0)
    return (
      <EmptyState
        icon={Bookmark}
        title="No bookmarks yet"
        subtitle="Starred/bookmarked entries across all users will appear here."
        ocid="admin.bookmarks.empty"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Desktop table */}
      <div
        className="hidden md:block rounded-2xl overflow-hidden"
        style={{ border: "1px solid #DDD6C8" }}
        data-ocid="admin.bookmarks.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#EEE7DA" }}>
              {["#", "User", "Name", "Description", "Prompt", "Saved On"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#7A7A7A" }}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr
                key={String(entry.id)}
                className="border-t hover:opacity-95 transition-opacity"
                style={{
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAF8F4",
                  borderColor: "#DDD6C8",
                }}
                data-ocid={`admin.bookmarks.row.${idx + 1}`}
              >
                <td
                  className="px-4 py-3 font-mono text-xs"
                  style={{ color: "#9A9A9A" }}
                >
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <PrincipalBadge principal={entry.userPrincipal.toString()} />
                </td>
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "#1A1A1A", maxWidth: "10rem" }}
                >
                  <span
                    className="flex items-center gap-1.5"
                    title={entry.name}
                  >
                    <Bookmark
                      className="w-3.5 h-3.5 fill-current flex-shrink-0"
                      style={{ color: "#F59E0B" }}
                    />
                    <span className="truncate">
                      {truncateText(entry.name, 40)}
                    </span>
                  </span>
                </td>
                <td
                  className="px-4 py-3"
                  style={{ color: "#5A5A5A", maxWidth: "12rem" }}
                  title={entry.description}
                >
                  {truncateText(entry.description, 60)}
                </td>
                <td
                  className="px-4 py-3"
                  style={{ color: "#7A7A7A", maxWidth: "12rem" }}
                  title={entry.prompt}
                >
                  {truncateText(entry.prompt, 60)}
                </td>
                <td
                  className="px-4 py-3 text-xs whitespace-nowrap"
                  style={{ color: "#7A7A7A" }}
                >
                  {formatDate(entry.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {entries.map((entry, idx) => (
          <motion.div
            key={String(entry.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
            data-ocid={`admin.bookmarks.card.${idx + 1}`}
          >
            <div className="flex items-center justify-between gap-2">
              <PrincipalBadge principal={entry.userPrincipal.toString()} />
              <span className="text-xs" style={{ color: "#9A9A9A" }}>
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark
                className="w-3.5 h-3.5 fill-current flex-shrink-0"
                style={{ color: "#F59E0B" }}
              />
              <span
                className="font-semibold text-sm"
                style={{ color: "#1A1A1A" }}
              >
                {entry.name}
              </span>
            </div>
            {entry.description && (
              <p className="text-sm" style={{ color: "#5A5A5A" }}>
                {truncateText(entry.description, 100)}
              </p>
            )}
            {entry.prompt && (
              <p className="text-xs italic" style={{ color: "#9A9A9A" }}>
                "{truncateText(entry.prompt, 80)}"
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Tab: User Activity ───────────────────────────────────────────────────────

interface UserActivity {
  principal: string;
  totalGenerations: number;
  totalBookmarks: number;
  lastActiveAt: bigint;
}

function UserActivityTab({
  logs,
  bookmarks,
}: {
  logs: AiGenerationLog[];
  bookmarks: StarredEntry[];
}) {
  const activities = useMemo<UserActivity[]>(() => {
    const map = new Map<
      string,
      { generations: number; bookmarks: number; lastAt: bigint }
    >();

    for (const log of logs) {
      const p = log.userPrincipal.toString();
      const existing = map.get(p) ?? {
        generations: 0,
        bookmarks: 0,
        lastAt: 0n,
      };
      map.set(p, {
        ...existing,
        generations: existing.generations + 1,
        lastAt:
          log.createdAt > existing.lastAt ? log.createdAt : existing.lastAt,
      });
    }

    for (const bm of bookmarks) {
      const p = bm.userPrincipal.toString();
      const existing = map.get(p) ?? {
        generations: 0,
        bookmarks: 0,
        lastAt: 0n,
      };
      map.set(p, {
        ...existing,
        bookmarks: existing.bookmarks + 1,
        lastAt: bm.createdAt > existing.lastAt ? bm.createdAt : existing.lastAt,
      });
    }

    return Array.from(map.entries())
      .map(([principal, v]) => ({
        principal,
        totalGenerations: v.generations,
        totalBookmarks: v.bookmarks,
        lastActiveAt: v.lastAt,
      }))
      .sort((a, b) =>
        a.lastActiveAt > b.lastActiveAt
          ? -1
          : a.lastActiveAt < b.lastActiveAt
            ? 1
            : 0,
      );
  }, [logs, bookmarks]);

  if (activities.length === 0)
    return (
      <EmptyState
        icon={Users}
        title="No user activity yet"
        subtitle="Per-user summaries of generations and bookmarks will appear here."
        ocid="admin.activity.empty"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Desktop table */}
      <div
        className="hidden md:block rounded-2xl overflow-hidden"
        style={{ border: "1px solid #DDD6C8" }}
        data-ocid="admin.activity.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#EEE7DA" }}>
              {[
                "#",
                "User",
                "Generations",
                "Bookmarks",
                "Total Actions",
                "Last Active",
              ].map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#7A7A7A" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((user, idx) => (
              <tr
                key={user.principal}
                className="border-t hover:opacity-95 transition-opacity"
                style={{
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAF8F4",
                  borderColor: "#DDD6C8",
                }}
                data-ocid={`admin.activity.row.${idx + 1}`}
              >
                <td
                  className="px-4 py-3 font-mono text-xs"
                  style={{ color: "#9A9A9A" }}
                >
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <PrincipalBadge principal={user.principal} />
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" style={{ color: "#6F9D79" }} />
                    <span
                      className="font-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {user.totalGenerations}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <Bookmark
                      className="w-3.5 h-3.5"
                      style={{ color: "#F59E0B" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {user.totalBookmarks}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#D9EFE1", color: "#4A7D5A" }}
                  >
                    {user.totalGenerations + user.totalBookmarks}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-xs whitespace-nowrap"
                  style={{ color: "#7A7A7A" }}
                >
                  {user.lastActiveAt > 0n
                    ? formatTimestamp(user.lastActiveAt)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {activities.map((user, idx) => (
          <motion.div
            key={user.principal}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
            data-ocid={`admin.activity.card.${idx + 1}`}
          >
            <PrincipalBadge principal={user.principal} />
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
                  {user.totalGenerations}
                </p>
                <p className="text-xs" style={{ color: "#7A7A7A" }}>
                  Generations
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
                  {user.totalBookmarks}
                </p>
                <p className="text-xs" style={{ color: "#7A7A7A" }}>
                  Bookmarks
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: "#6F9D79" }}>
                  {user.totalGenerations + user.totalBookmarks}
                </p>
                <p className="text-xs" style={{ color: "#7A7A7A" }}>
                  Total
                </p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "#9A9A9A" }}>
              Last active:{" "}
              {user.lastActiveAt > 0n
                ? formatTimestamp(user.lastActiveAt)
                : "—"}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Tab: All History (Timeline) ─────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  type: "generated" | "bookmarked";
  principal: string;
  description: string;
  timestamp: bigint;
  imageUrl?: string;
}

function AllHistoryTab({
  logs,
  bookmarks,
}: {
  logs: AiGenerationLog[];
  bookmarks: StarredEntry[];
}) {
  const events = useMemo<TimelineEvent[]>(() => {
    const genEvents: TimelineEvent[] = logs.map((l) => ({
      id: `gen-${l.id}`,
      type: "generated",
      principal: l.userPrincipal.toString(),
      description: l.prompt,
      timestamp: l.createdAt,
      imageUrl: l.outputImageBlobId || undefined,
    }));

    const bmEvents: TimelineEvent[] = bookmarks.map((b) => ({
      id: `bm-${b.id}`,
      type: "bookmarked",
      principal: b.userPrincipal.toString(),
      description: b.name || b.description || b.prompt,
      timestamp: b.createdAt,
      imageUrl: b.imageUrl || undefined,
    }));

    return [...genEvents, ...bmEvents].sort((a, b) =>
      a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0,
    );
  }, [logs, bookmarks]);

  if (events.length === 0)
    return (
      <EmptyState
        icon={Activity}
        title="No events yet"
        subtitle="All generation and bookmark events across users will appear here in chronological order."
        ocid="admin.timeline.empty"
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-2"
      data-ocid="admin.timeline.list"
    >
      {events.map((event, idx) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(idx * 0.02, 0.4) }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:opacity-95 transition-opacity"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
          data-ocid={`admin.timeline.event.${idx + 1}`}
        >
          {/* Event type pill */}
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 w-28 justify-center"
            style={
              event.type === "generated"
                ? { backgroundColor: "#D9EFE1", color: "#4A7D5A" }
                : { backgroundColor: "#FEF3C7", color: "#92400E" }
            }
          >
            {event.type === "generated" ? (
              <>
                <Zap className="w-3 h-3" />
                Generated
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3 fill-current" />
                Bookmarked
              </>
            )}
          </span>

          <PrincipalBadge principal={event.principal} />

          <span
            className="flex-1 text-sm truncate min-w-0"
            style={{ color: "#3A3A3A" }}
            title={event.description}
          >
            {truncateText(event.description, 80)}
          </span>

          {event.imageUrl && (
            <ImageThumb src={event.imageUrl} alt="event image" />
          )}

          <span
            className="text-xs whitespace-nowrap flex-shrink-0 flex items-center gap-1"
            style={{ color: "#9A9A9A" }}
          >
            <Clock className="w-3 h-3" />
            {formatTimestamp(event.timestamp)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminLogsPage({ onBack, actor }: AdminLogsPageProps) {
  const [logs, setLogs] = useState<AiGenerationLog[]>([]);
  const [bookmarks, setBookmarks] = useState<StarredEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("logs");

  // Puter token management
  const [newToken, setNewToken] = useState("");
  const [savingToken, setSavingToken] = useState(false);

  useEffect(() => {
    if (!actor) {
      // Keep loading=true — actor will resolve shortly and re-trigger this effect
      setLoading(true);
      return;
    }
    setLoading(true);
    Promise.all([
      (
        actor as Record<string, (...args: unknown[]) => unknown>
      ).getAiGenerationLogsReverse() as Promise<AiGenerationLog[]>,
      (
        (
          actor as Record<string, (...args: unknown[]) => unknown>
        ).getMyStarredEntries() as Promise<StarredEntry[]>
      ).catch(() => [] as StarredEntry[]),
    ])
      .then(([logsResult, bmResult]) => {
        setLogs(logsResult);
        setBookmarks(bmResult as StarredEntry[]);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Admin: failed to load data:", err);
        toast.error("Failed to load admin data");
        setLoading(false);
      });
  }, [actor]);

  async function handleSaveToken() {
    if (!newToken.trim()) {
      toast.error("Please enter a token");
      return;
    }
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setSavingToken(true);
    try {
      const trimmed = newToken.trim();
      await (
        actor as Record<string, (...args: unknown[]) => unknown>
      ).setPuterToken(trimmed);
      const puter = (window as unknown as Record<string, unknown>).puter as
        | Record<string, unknown>
        | undefined;
      if (puter) {
        puter.authToken = trimmed;
        const auth = puter.auth as Record<string, unknown> | undefined;
        if (auth) {
          auth.getToken = () => Promise.resolve(trimmed);
          auth.isSignedIn = () => true;
        }
        if (typeof puter._token !== "undefined") puter._token = trimmed;
      }
      toast.success("Puter.js auth token updated successfully");
      setNewToken("");
    } catch (err: unknown) {
      console.error("Failed to set puter token:", err);
      toast.error("Failed to update token");
    } finally {
      setSavingToken(false);
    }
  }

  // Derived stats
  const uniqueUsers = useMemo(() => {
    const principals = new Set<string>();
    for (const l of logs) principals.add(l.userPrincipal.toString());
    for (const b of bookmarks) principals.add(b.userPrincipal.toString());
    return principals.size;
  }, [logs, bookmarks]);

  const latestTimestamp = useMemo(() => {
    let latest = 0n;
    for (const l of logs) if (l.createdAt > latest) latest = l.createdAt;
    for (const b of bookmarks) if (b.createdAt > latest) latest = b.createdAt;
    return latest;
  }, [logs, bookmarks]);

  const TABS: {
    id: TabId;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      id: "logs",
      label: "Generation Logs",
      icon: Database,
      count: logs.length,
    },
    {
      id: "bookmarks",
      label: "Bookmark History",
      icon: Bookmark,
      count: bookmarks.length,
    },
    { id: "activity", label: "User Activity", icon: Users, count: uniqueUsers },
    {
      id: "timeline",
      label: "All History",
      icon: Activity,
      count: logs.length + bookmarks.length,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3F0E6" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "#EEE7DA", borderColor: "#DDD6C8" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "#6F9D79" }}
            data-ocid="admin.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6F9D79" }}
            >
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="font-bold text-lg" style={{ color: "#1A1A1A" }}>
              Admin Panel
            </h1>
          </div>
          {!loading && (
            <span
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#D9EFE1", color: "#4A7D5A" }}
              data-ocid="admin.users.badge"
            >
              <Users className="w-3 h-3" />
              {uniqueUsers} {uniqueUsers === 1 ? "user" : "users"}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Summary Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDD6C8",
                }}
              >
                <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                <Skeleton className="w-12 h-6 rounded mb-1" />
                <Skeleton className="w-20 h-3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            data-ocid="admin.stats.section"
          >
            <StatCard
              icon={TrendingUp}
              label="Total Generations"
              value={logs.length}
              accent="#6F9D79"
            />
            <StatCard
              icon={Bookmark}
              label="Total Bookmarks"
              value={bookmarks.length}
              accent="#F59E0B"
            />
            <StatCard
              icon={Users}
              label="Unique Users"
              value={uniqueUsers}
              accent="#8B6EAF"
            />
            <StatCard
              icon={Clock}
              label="Last Activity"
              value={latestTimestamp > 0n ? formatDate(latestTimestamp) : "—"}
              accent="#4ECDC4"
            />
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          data-ocid="admin.tabs.nav"
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              count={loading ? undefined : tab.count}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <LoadingRows cols={6} />
        ) : (
          <div data-ocid="admin.tab.content">
            {activeTab === "logs" && <GenerationLogsTab logs={logs} />}
            {activeTab === "bookmarks" && (
              <BookmarkHistoryTab entries={bookmarks} />
            )}
            {activeTab === "activity" && (
              <UserActivityTab logs={logs} bookmarks={bookmarks} />
            )}
            {activeTab === "timeline" && (
              <AllHistoryTab logs={logs} bookmarks={bookmarks} />
            )}
          </div>
        )}

        {/* Puter API Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD6C8" }}
          data-ocid="admin.api_key.section"
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#EEE7DA" }}
            >
              <Key className="w-3.5 h-3.5" style={{ color: "#6F9D79" }} />
            </div>
            <h2
              className="font-semibold text-base"
              style={{ color: "#1A1A1A" }}
            >
              Puter.js API Key
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "#7A7A7A" }}>
            Update the Puter.js auth token used for AI generation. The token is
            stored securely in the backend and never exposed to users.
          </p>
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="Paste new Puter.js auth token here…"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="flex-1 font-mono text-sm"
              style={{ borderColor: "#DDD6C8" }}
              data-ocid="admin.api_key.input"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveToken();
              }}
            />
            <Button
              onClick={handleSaveToken}
              disabled={savingToken || !newToken.trim()}
              className="flex items-center gap-1.5 px-4"
              style={{ backgroundColor: "#6F9D79", color: "white" }}
              data-ocid="admin.api_key.save_button"
            >
              <Save className="w-4 h-4" />
              {savingToken ? "Saving…" : "Save"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
