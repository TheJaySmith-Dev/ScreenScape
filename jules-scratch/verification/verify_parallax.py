from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    try:
        # Wait for the API key modal to appear, with a short timeout
        page.wait_for_selector('h2:has-text("API Keys Required")', timeout=5000)

        # If the modal is found, fill in the keys and submit
        page.get_by_placeholder("Enter your TMDb API Key (v3 auth)").fill("dummy_tmdb_api_key_long_enough")
        page.get_by_placeholder("Enter your Gemini API Key").fill("dummy_gemini_api_key_long_enough")
        page.get_by_placeholder("Enter your KinoCheck API Key").fill("dummy_kinocheck_api_key_long_enough")
        page.get_by_role("button", name="Save and Continue").click()

    except TimeoutError:
        # If the modal doesn't appear, that's fine, we can continue
        print("API Key modal not found, proceeding...")

    # Now, wait for the hero section to be visible
    page.wait_for_selector('.hero-section')

    # Scroll down to show the parallax effect
    page.evaluate("window.scrollBy(0, 500)")

    # Wait a bit for the parallax effect to be visible
    page.wait_for_timeout(1000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
