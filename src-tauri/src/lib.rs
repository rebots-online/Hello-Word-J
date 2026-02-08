// Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
use tauri::command;

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|_app| {
            println!("Initializing SanctissiMissa...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
