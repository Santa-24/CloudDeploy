import subprocess
import time
import os
import urllib.request

os.makedirs('screenshots', exist_ok=True)
chrome_exe = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

print("Starting Vite development server with VITE_DEMO_MODE=true...")
env = os.environ.copy()
env['VITE_DEMO_MODE'] = 'true'

server_process = subprocess.Popen(
    ['npm.cmd', 'run', 'dev', '--', '--port', '5173', '--host', '127.0.0.1'],
    cwd='frontend',
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

for i in range(30):
    try:
        urllib.request.urlopen('http://127.0.0.1:5173', timeout=1)
        print(f"Vite dev server is ready (attempt {i+1})")
        break
    except Exception:
        time.sleep(1)

routes = [
    ("fig1_landing_hero.png", "http://127.0.0.1:5173/"),
    ("fig2_features_showcase.png", "http://127.0.0.1:5173/features"),
    ("fig3_pricing_finops.png", "http://127.0.0.1:5173/pricing"),
    ("fig4_templates_hub.png", "http://127.0.0.1:5173/templates"),
    ("fig5_docs_api.png", "http://127.0.0.1:5173/docs"),
    ("fig6_auth_login.png", "http://127.0.0.1:5173/login"),
    ("fig7_dashboard_overview.png", "http://127.0.0.1:5173/dashboard"),
    ("fig8_projects_catalog.png", "http://127.0.0.1:5173/projects"),
    ("fig9_project_detail_active.png", "http://127.0.0.1:5173/projects/site-a7b2-doc"),
    ("fig10_upload_deploy_zone.png", "http://127.0.0.1:5173/projects/site-a7b2-doc/deploy"),
    ("fig11_deployment_history_rollback.png", "http://127.0.0.1:5173/projects/site-a7b2-doc/history"),
    ("fig12_usage_quotas.png", "http://127.0.0.1:5173/usage"),
    ("fig13_admin_overview.png", "http://127.0.0.1:5173/admin"),
    ("fig14_admin_deployments.png", "http://127.0.0.1:5173/admin/deployments")
]

print(f"Capturing {len(routes)} high-resolution screenshots...")
for filename, url in routes:
    out_path = os.path.abspath(os.path.join('screenshots', filename))
    cmd = [
        chrome_exe,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--window-size=1600,1000',
        '--virtual-time-budget=2000',
        f'--screenshot={out_path}',
        url
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(out_path):
        size_kb = os.path.getsize(out_path) / 1024
        print(f"  [OK] Captured {filename} ({size_kb:.1f} KB) from {url}")
    else:
        print(f"  [FAIL] Failed to capture {filename}")
    time.sleep(0.5)

server_process.terminate()
server_process.wait()
print("\nAll high-resolution screenshots successfully saved in 'screenshots/' folder!")
