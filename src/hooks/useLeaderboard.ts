import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type LeaderboardRow = {
  id: string;
  display_name: string | null;
  xp: number;
};

export const useLeaderboard = (limit = 50) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<{ xp: number; rank: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, xp")
        .order("xp", { ascending: false })
        .limit(limit);
      if (cancelled) return;
      const list = (data ?? []) as LeaderboardRow[];
      setRows(list);
      if (user) {
        const mine = list.find((r) => r.id === user.id);
        if (mine) {
          setMe({ xp: mine.xp, rank: list.indexOf(mine) + 1 });
        } else {
          const { data: self } = await supabase
            .from("profiles")
            .select("xp")
            .eq("id", user.id)
            .maybeSingle();
          const myXp = self?.xp ?? 0;
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gt("xp", myXp);
          setMe({ xp: myXp, rank: (count ?? 0) + 1 });
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  return { rows, me, loading };
};

export const useMyXp = () => {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setXp(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setXp(data?.xp ?? 0);
        setLoading(false);
      }
    })();
    const channel = supabase
      .channel(`profile-xp-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload: any) => setXp(payload.new.xp ?? 0)
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { xp, loading };
};
