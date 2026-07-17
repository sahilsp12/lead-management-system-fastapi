from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_root_endpoint():

    """Verify that the root endpoint executes and returns database connectivity confirmation."""

    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "success" in data

    assert data["success"] is True

def test_login_invalid_credentials():

    """Ensure that submitting incorrect credentials returns an unauthorized HTTP error."""

    response = client.post(

        "/api/v1/auth/login",

        json={"email": "wrong@test.com", "password": "wrongpassword"}

    )

    assert response.status_code == 401

    assert response.json()["detail"] == "Incorrect email or password"

def test_list_leads_unauthorized():

    """Confirm that listing leads requires credentials and returns 401 otherwise."""

    response = client.get("/api/v1/leads/")

    assert response.status_code == 401

