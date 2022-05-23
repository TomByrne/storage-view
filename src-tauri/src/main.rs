#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use fstat::options::FileStats;
use fstat::options::{Handlers, Options as FStatOptions, OutputOption};
use fstat::run;
use fstat::systems::FileSystem;
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, Window};

const SEND_FILE_COUNT: usize = 100;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![show_devtools, create_job])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn show_devtools(window: Window, shown: bool) -> Result<(), String> {
  println!("show_devtools: {}", shown);
  if shown {
    window.open_devtools();
  } else {
    window.close_devtools();
  }
  return Ok(());
}

#[tauri::command]
async fn create_job(handle: AppHandle, id: i32, path: String) -> Result<(), String> {
  println!("Creating job: {}", path);

  if !Path::new(&path).exists() {
    return Err(format!("Path not found: {}", path));
  }

  let opts = FStatOptions {
    multithread: true,
    verbose: false,
    output: OutputOption::All,
  };

  fn prog_handler(fs: FileStats, data: &JobData) {
    if fs.is_dir && fs.path == data.path {
      // Is root node
      end_handler(fs, data);
    }
  }

  fn end_handler(fs: FileStats, data: &JobData) {
    let file = JobFileInfo {
      path: fs.path,
      name: fs.name,
      is_dir: fs.is_dir,
      child_count: fs.child_count,
      depth: fs.depth,
      index: fs.index,
      total: fs.total,
      time: fs.time_s,
      size: fs.size_b,
    };

    let mut pending = data.pending.lock().unwrap();

    // Remove old copies of this file object
    let filter = |f: &JobFileInfo| f.path == file.path;
    // pending.drain_filter(filter); // TODO: use this method when `drain_filter` is released to stable
    let mut i = 0;
    while i < pending.len() {
      if filter(&pending[i]) {
        pending.remove(i);
      } else {
        i += 1;
      }
    }

    pending.push(file);

    if pending.len() >= SEND_FILE_COUNT {
      let prog = JobProgress {
        job: data.job,
        files: pending.clone(),
        done: false,
      };
      pending.clear();
      drop(pending);
      data.handle.emit_all("create_job/prog", prog).unwrap();
    }
  }

  let job_data: JobData = JobData {
    job: id,
    path: path.clone(),
    handle: handle,
    pending: Mutex::new(Vec::new()),
  };

  let handlers: Handlers<JobData> = Handlers {
    post: None,
    start: None,
    prog: Some(prog_handler),
    end: Some(end_handler),
  };

  let fs: Arc<dyn FileSystem> = Arc::new(fstat::systems::fs::Fs {});
  run(&path, opts, handlers, &job_data, &fs);

  let pending: Vec<JobFileInfo> = job_data.pending.lock().unwrap().clone();
  // if pending.len() > 0 {
  let prog = JobProgress {
    job: job_data.job,
    files: pending,
    done: true,
  };
  job_data.handle.emit_all("create_job/prog", prog).unwrap();
  // }

  return Ok(());
}

struct JobData {
  job: i32,
  path: String,
  handle: AppHandle,
  pending: Mutex<Vec<JobFileInfo>>,
}

#[derive(serde::Serialize, Clone)]
struct JobProgress {
  job: i32,
  files: Vec<JobFileInfo>,
  done: bool,
}

#[derive(serde::Serialize, Clone)]
struct JobFileInfo {
  path: String,
  name: String,
  is_dir: bool,
  child_count: usize,
  depth: u32,
  index: u32,
  total: u32,

  time: u64, // seconds
  size: u64, // bytes
}
