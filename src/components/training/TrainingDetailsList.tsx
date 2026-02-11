import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

/* ================= TYPES ================= */

interface TrainingUserRow {
  id: string;
  name: string; // full name
  ongoing_count: number;
  daily_count: number;
}

/* ================= COMPONENT ================= */

export default function TrainingDetailsList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<TrainingUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_training_summary");

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setData(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER ================= */

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= NAVIGATION ================= */

  const handleView = (profileId: string) => {
    const base = location.pathname.startsWith("/admin") ? "/admin" : "/hr";
    navigate(`${base}/training/details/${profileId}`);
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold">Training Details</h1>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Ongoing Training Count</TableHead>
                <TableHead>Daily Training (current month)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.ongoing_count}</TableCell>
                  <TableCell>{row.daily_count}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleView(row.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
