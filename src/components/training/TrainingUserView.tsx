import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

/* ================= TYPES ================= */

interface OngoingTraining {
  id: string;
  name: string;
  domain: string;
  from_date: string;
  to_date: string;
  time_from: string;
  time_to: string;
  status: string;
}

interface DailyTraining {
  id: string;
  name: string;
  domain: string;
  description: string;
  date: string;
  time_from: string;
  time_to: string;
}

/* ================= FORM SCHEMA ================= */

const schema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  description: z.string().min(1),
  time_from: z.string().min(1),
  time_to: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

/* ================= COMPONENT ================= */

export default function TrainingUserView() {
  const { profileId } = useParams<{ profileId: string }>();
  const { toast } = useToast();

  const [userName, setUserName] = useState<string>("");
  const [ongoing, setOngoing] = useState<OngoingTraining[]>([]);
  const [daily, setDaily] = useState<DailyTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const [editItem, setEditItem] = useState<DailyTraining | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
      time_from: "",
      time_to: "",
    },
  });

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    if (!profileId) return;

    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_user_training_details",
      { p_profile_id: profileId }
    );

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setUserName(data.name || "User");
      setOngoing(data.ongoing || []);
      setDaily(data.daily || []);
    }

    setLoading(false);
  };


  useEffect(() => {
    fetchData();
  }, [profileId]);

  /* ================= EDIT DAILY ================= */

  const onSubmit = async (values: FormValues) => {
    if (!editItem) return;

    const { error } = await supabase.rpc("update_daily_training", {
      p_id: editItem.id,
      p_name: values.name,
      p_domain: values.domain,
      p_description: values.description,
      p_time_from: values.time_from,
      p_time_to: values.time_to,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Updated", description: "Daily training updated" });

    setDialogOpen(false);
    setEditItem(null);
    fetchData();
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
      <h1 className="text-3xl font-bold">{userName} — Training Details</h1>

      {/* -------- Ongoing Training -------- */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Ongoing Training</h2>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Timing</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ongoing.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.name}</TableCell>
                  <TableCell>{o.domain}</TableCell>
                  <TableCell>{format(new Date(o.from_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(o.to_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {format(new Date(`1970-01-01T${o.time_from}`), "hh:mm a")} -{" "}
                    {format(new Date(`1970-01-01T${o.time_to}`), "hh:mm a")}
                  </TableCell>

                </TableRow>
              ))}

              {ongoing.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No ongoing training
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------- Daily Training -------- */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Daily Training (Current Month)</h2>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {daily.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.domain}</TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>{format(new Date(d.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {format(new Date(`1970-01-01T${d.time_from}`), "hh:mm a")} -{" "}
                    {format(new Date(`1970-01-01T${d.time_to}`), "hh:mm a")}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditItem(d);
                        form.reset({
                          name: d.name,
                          domain: d.domain,
                          description: d.description,
                          time_from: d.time_from,
                          time_to: d.time_to,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {daily.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No daily training this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------- Edit Dialog -------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Training</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {["name", "domain", "description"].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName as keyof FormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{fieldName}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="grid grid-cols-2 gap-4">
                {["time_from", "time_to"].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldName === "time_from" ? "From" : "To"} Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
