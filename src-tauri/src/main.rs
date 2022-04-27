#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use fstat::options::FileStats;
use fstat::options::{Handlers, Options as FStatOptions, OutputOption};
use fstat::run;
use fstat::systems::FileSystem;
use serde::Deserialize;
use std::path::Path;
use std::sync::Arc;
use tauri::{App, AppHandle, Manager};

fn main() {
  tauri::Builder::default()
    // .setup(|app| {
    //   app.listen_global("create_job", |event| {
    //     let emit = |e:&str, s:String| {
    //       app.emit_all(e, s);
    //     };
    //     if let Some(json_str) = event.payload() {
    //       let res = serde_json::from_str::<CreateJobRequest>(json_str);
    //       if let Ok(request) = res {
    //         create_job(&emit, request.id, request.path);
    //       } else if let Err(error) = res {
    //         println!("Failed to parse create_job request: {}", error);
    //       }
    //     }
    //   });
    //   Ok(())
    // })
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

  fn prog_handler(fs: FileStats, data: &JobData) {
    let json_str = serde_json::json!({
      "job": data.job,
      "path": fs.path,
      "size_b": fs.size_b,
    });

    println!("prog: {}", json_str);

    data
      .handle
      .emit_all("create_job/prog", json_str.to_string())
      .unwrap();
  }

  let job_data: JobData = JobData {
    job: id,
    handle: handle,
  };

  let handlers: Handlers<JobData> = Handlers {
    post: None,
    start: None,
    prog: Some(prog_handler),
    end: None,
  };

  let fs: Arc<dyn FileSystem> = Arc::new(fstat::systems::fs::Fs {});
  run(&path, opts, handlers, &job_data, &fs);

  return Ok(());
}

struct JobData {
  job: i32,
  handle: AppHandle,
}

// #[derive(Deserialize, Debug)]
// struct CreateJobRequest {
//   id: i32,
//   path: String,
// }
