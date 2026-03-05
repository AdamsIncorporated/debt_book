#[cfg(test)]
pub mod tests {
    use crate::AppState;
    use crate::config::Config;
    use crate::endpoints::scopes::{delete_scope, get_scope, patch_scope, post_scope};
    use crate::structs::get::DebtSeries;
    use crate::tests::data::{PATCH_STR, POST_STR};
    use actix_web::{App, test, web};
    use odbc_api::Environment;
    use serde_json::json;
    use std::sync::Arc;

    #[actix_web::test]
    async fn test_debt_crud_flow_flat() {
        // --- Setup App ---
        env_logger::init();

        let config = Config::from_file("./secrets.toml").expect("Failed to load secrets.toml");
        let conn_str = config.to_connection_string();

        let env = Arc::new(Environment::new().expect("Failed to initialize ODBC environment"));
        let state = AppState { env, conn_str };
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(state.clone()))
                .service(get_scope())
                .service(post_scope())
                .service(patch_scope())
                .service(delete_scope()),
        )
        .await;

        // --- Step 1: POST new series ---
        let post_req = test::TestRequest::post()
            .uri("/post/post_series")
            .set_payload(&*POST_STR)
            .insert_header(("Content-Type", "application/json"))
            .to_request();
        let post_resp = test::call_service(&app, post_req).await;
        assert!(post_resp.status().is_success(), "POST series failed");

        // --- Step 2: GET all series and find inserted ID ---
        let get_req = test::TestRequest::get()
            .uri("/get/get_all_series")
            .to_request();
        let get_resp = test::call_service(&app, get_req).await;
        assert!(get_resp.status().is_success(), "GET all series failed");

        let body_bytes = test::read_body(get_resp).await;
        let all_series: Vec<DebtSeries> = serde_json::from_slice(&body_bytes).unwrap();
        let id = all_series
            .into_iter()
            .find(|s| s.series_name == "TEST_SERIES")
            .expect("Inserted dummy not found")
            .id;

        // --- Step 3: PATCH series ---
        let patch_req = test::TestRequest::put()
            .uri("/patch/patch_series")
            .set_payload(&*PATCH_STR)
            .insert_header(("Content-Type", "application/json"))
            .to_request();
        let patch_resp = test::call_service(&app, patch_req).await;
        assert!(patch_resp.status().is_success(), "PATCH series failed");

        // --- Step 4: GET by ID and verify update ---
        let verify_patch_req = test::TestRequest::get()
            .uri(&format!("/get/get_debt_series_by_id/{}", id))
            .to_request();
        let verify_patch_resp = test::call_service(&app, verify_patch_req).await;
        assert!(
            verify_patch_resp.status().is_success(),
            "GET by ID after patch failed for ID: {}",
            id
        );

        let patch_body_bytes = test::read_body(verify_patch_resp).await;
        let series_by_id: Vec<DebtSeries> = serde_json::from_slice(&patch_body_bytes).unwrap();
        assert_eq!(series_by_id[0].series_name, "TEST_SERIES_UPDATED");
        assert_eq!(series_by_id[0].par_amount, 2000.0);

        // --- Step 5: DELETE series ---
        let delete_payload = json!({ "id": id });
        let delete_req = test::TestRequest::put()
            .uri("delete/delete_all_series")
            .set_json(&delete_payload)
            .to_request();
        let delete_resp = test::call_service(&app, delete_req).await;
        assert!(delete_resp.status().is_success(), "DELETE series failed");

        // --- Step 6: Verify deletion ---
        let verify_delete_req = test::TestRequest::get()
            .uri(&format!("get/get_debt_series_by_id/{}", id))
            .to_request();
        let verify_delete_resp = test::call_service(&app, verify_delete_req).await;
        assert!(
            verify_delete_resp.status().is_success(),
            "GET by ID after delete failed"
        );

        let delete_body_bytes = test::read_body(verify_delete_resp).await;
        let series_after_delete: Vec<DebtSeries> =
            serde_json::from_slice(&delete_body_bytes).unwrap();
        assert!(series_after_delete.is_empty(), "Dummy should be deleted");
    }
}
