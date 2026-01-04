// Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{
  api::shell,
  command,
  generate_context, generate_handler,
  Manager,
  Window,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
async fn open_external_link(url: String) -> Result<(), String> {
    shell::open(&shell::Scope::default(), url, None)
        .map_err(|e| format!("Failed to open link: {}", e))
}

#[command]
async fn close_splashscreen(window: Window) {
  // Close splashscreen
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Show main window
  window.get_window("main").unwrap().show().unwrap();
}

fn main() {
    let context = generate_context!();
    tauri::Builder::default()
        .invoke_handler(generate_handler![
            greet,
            open_external_link,
            close_splashscreen
        ])
        .setup(|app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();
            let main_window = app.get_window("main").unwrap();
            
            // we perform the initialization code on a new task so the app doesn't crash
            tauri::async_runtime::spawn(async move {
                // initialize your app here instead of sleeping :)
                println!("Initializing SanctissiMissa...");
                std::thread::sleep(std::time::Duration::from_millis(2000));
                println!("Done initializing.");

                // After it's done, close the splashscreen and display the main window
                splashscreen_window.close().unwrap();
                main_window.show().unwrap();
            });
            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");
}