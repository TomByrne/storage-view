#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use fstat::options::{Options as FStatOptions, OutputOption};
use fstat::{run, FileStats};
use std::path::Path;
use std::sync::Arc;
// use std::collections::HashMap;
use fstat::systems::FileSystem;

// type JobId = i32;

struct State {
  // job_counter: JobId,
  // job_ids: Vec<JobId>,
  // output: HashMap<JobId, Vec<String>>,
}

fn main() {
  let state = State {
    // job_counter: 0,
    // job_ids: Vec::new(),
    // output: HashMap::new(),
  };

  tauri::Builder::default()
    .manage(state)
    // .invoke_handler(tauri::generate_handler![list_jobs])
    .invoke_handler(tauri::generate_handler![create_job])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// #[tauri::command]
// fn list_jobs(state: tauri::State<State>) -> Vec<JobId> {
//   return state.job_ids.to_owned();
// }

#[tauri::command]
fn create_job(_state: tauri::State<State>, path: String) -> Result<String, String> {
  println!("Creating job: {}", path);

  if !Path::new(&path).exists() {
    return Err(format!("Path not found: {}", path));
  }

  // let id = state.job_counter;
  // state.job_counter += 1;
  // state.job_ids.push(id);
  let verbose = true;

  let opts = FStatOptions {
    multithread: true,
    verbose: verbose,
    output: OutputOption::All,

    template: None,
    template_start: None,
    template_prog: None,
    template_end: None,
    print: None,
  };

  let fs: Arc<dyn FileSystem> = Arc::new(fstat::systems::fs::Fs {});

  let files: Vec<FileStats> = run(&path, opts, &fs);
  let mut results: Vec<String> = Vec::new();
  for stats in files.iter() {
    results.push(format!("{},{},{}/n", stats.path, stats.depth, stats.size_b));
  }

  println!("hmmm {}", results.len());
  
  // state.job_ids.remove(id);

  return Ok(results.join("\n").to_string());
}
