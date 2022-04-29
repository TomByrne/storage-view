#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use fstat::options::FileStats;
use fstat::options::{Handlers, Options as FStatOptions, OutputOption};
use fstat::run;
use fstat::systems::FileSystem;
use std::path::Path;
use std::sync::Arc;
use tauri::{ AppHandle, Manager };

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![create_job])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn create_job(handle: AppHandle, id: i32, path: String) -> Result<(), String> {
  println!("Creating job: {}", path);

  if !Path::new(&path).exists() {
    return Err(format!("Path not found: {}", path));
  }

  let verbose = true;

  let opts = FStatOptions {
    multithread: true,
    verbose: verbose,
    output: OutputOption::All,
  };

  fn start_handler(fs: FileStats, data: &JobData) {
    if fs.is_dir { end_handler(fs, data); }
  }

  fn end_handler(fs: FileStats, data: &JobData) {

    let mut files: Vec<JobFileInfo> = Vec::new();
    files.push(JobFileInfo {
      path: fs.path,
      name: fs.name,
      is_dir: fs.is_dir,
      
      depth: fs.depth,
      index: fs.index,
      total: fs.total,
    
      time: fs.time_s,
      size: fs.size_b,
    });

    let prog = JobProgress {
      job: data.job,
      files: files,
    };
    
    data
      .handle
      .emit_all("create_job/prog", prog)
      .unwrap();
  }

  let job_data: JobData = JobData {
    job: id,
    handle: handle,
  };

  let handlers: Handlers<JobData> = Handlers {
    post: None,
    start: Some(start_handler),
    prog: None,
    end: Some(end_handler),
  };

  let fs: Arc<dyn FileSystem> = Arc::new(fstat::systems::fs::Fs {});
  run(&path, opts, handlers, &job_data, &fs);

  return Ok(());
}

struct JobData {
  job: i32,
  handle: AppHandle,
}

#[derive(serde::Serialize)]
#[derive(Clone)]
struct JobProgress {
  job: i32,
  files: Vec<JobFileInfo>
}

#[derive(serde::Serialize)]
#[derive(Clone)]
struct JobFileInfo {
  path: String,
  name: String,
  is_dir: bool,
  
  depth: u32,
  index: u32,
  total: u32,

  time: u64, // seconds
  size: u64, // bytes
}