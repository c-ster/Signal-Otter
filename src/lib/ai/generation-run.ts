import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerationType } from "@/types/database";

export async function createRun(
  supabase: SupabaseClient,
  userId: string,
  candidatePageId: string,
  generationType: GenerationType,
  inputJson: Record<string, unknown>,
  promptVersion: string
): Promise<string> {
  const { data, error } = await supabase
    .from("generation_runs")
    .insert({
      user_id: userId,
      candidate_page_id: candidatePageId,
      generation_type: generationType,
      input_json: inputJson,
      prompt_version: promptVersion,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create generation run: ${error?.message}`);
  }
  return data.id;
}

export async function markRunning(
  supabase: SupabaseClient,
  runId: string
): Promise<void> {
  const { error } = await supabase
    .from("generation_runs")
    .update({ status: "running" })
    .eq("id", runId);

  if (error) {
    throw new Error(`Failed to mark run as running: ${error.message}`);
  }
}

export async function markCompleted(
  supabase: SupabaseClient,
  runId: string,
  outputJson: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("generation_runs")
    .update({ status: "completed", output_json: outputJson })
    .eq("id", runId);

  if (error) {
    throw new Error(`Failed to mark run as completed: ${error.message}`);
  }
}

export async function markFailed(
  supabase: SupabaseClient,
  runId: string,
  errorMessage: string
): Promise<void> {
  const { error } = await supabase
    .from("generation_runs")
    .update({
      status: "failed",
      output_json: { error: errorMessage },
    })
    .eq("id", runId);

  if (error) {
    console.error(`Failed to mark run as failed: ${error.message}`);
  }
}
