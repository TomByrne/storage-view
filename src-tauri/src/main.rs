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
use tauri::{AppHandle, Manager};

const SEND_FILE_COUNT: usize = 100;

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
    if fs.is_dir {
      end_handler(fs, data);
    }
  }

  fn end_handler(fs: FileStats, data: &JobData) {
    let file = JobFileInfo {
      path: fs.path,
      name: fs.name,
      is_dir: fs.is_dir,
      depth: fs.depth,
      index: fs.index,
      total: fs.total,
      time: fs.time_s,
      size: fs.size_b,
    };

    // let mut files = Vec::new();
    // files.push(file);
    // let prog = JobProgress {
    //   job: data.job,
    //   files: files,
    // };
    // data.handle.emit_all("create_job/prog", prog).unwrap();

    
    let mut pending = data.pending.lock().unwrap();

    // Remove old copies of this file object
    let filter = |f:&JobFileInfo| f.path == file.path;
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
      };
      pending.clear();
      drop(pending);
      data.handle.emit_all("create_job/prog", prog).unwrap();
    }
  }

  let job_data: JobData = JobData {
    job: id,
    handle: handle,
    pending: Mutex::new(Vec::new()),
  };

  let handlers: Handlers<JobData> = Handlers {
    post: None,
    start: Some(start_handler),
    prog: None,
    end: Some(end_handler),
  };

  let fs: Arc<dyn FileSystem> = Arc::new(fstat::systems::fs::Fs {});
  run(&path, opts, handlers, &job_data, &fs);

  let pending: Vec<JobFileInfo> = job_data.pending.lock().unwrap().clone();
  if pending.len() > 0 {
    let prog = JobProgress {
      job: job_data.job,
      files: pending,
    };
    job_data.handle.emit_all("create_job/prog", prog).unwrap();
  }

  return Ok(());
}

struct JobData {
  job: i32,
  handle: AppHandle,
  pending: Mutex<Vec<JobFileInfo>>,
}

#[derive(serde::Serialize, Clone)]
struct JobProgress {
  job: i32,
  files: Vec<JobFileInfo>,
}

#[derive(serde::Serialize, Clone)]
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
