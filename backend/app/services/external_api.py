import httpx

def fetch_random_user_data() -> dict | None:
    """
    Fetches a random user profile from the public Random User API.
    Returns a dictionary with name, email, phone, and location, or None if the call fails.
    """
    url = "https://randomuser.me/api/?nat=us,gb,ca"
    try:
        response = httpx.get(url, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            if "results" in data and len(data["results"]) > 0:
                user_data = data["results"][0]
                
                # Parse details
                first_name = user_data.get("name", {}).get("first", "")
                last_name = user_data.get("name", {}).get("last", "")
                name = f"{first_name} {last_name}".strip() or "Random Lead"
                
                email = user_data.get("email", "")
                phone = user_data.get("phone", "")
                
                # Fetch location for additional lead notes
                city = user_data.get("location", {}).get("city", "")
                state = user_data.get("location", {}).get("state", "")
                location = f"{city}, {state}"
                
                return {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "location": location
                }
    except Exception:
        pass
    return None
