import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ------------------------------------------------------------------------------
# THEME CONFIGURATION (Matches Reference CloudTwin Design)
# ------------------------------------------------------------------------------
BG_DARK = RGBColor(0x0B, 0x10, 0x1B)        # Deep Midnight Slate
BG_LIGHT = RGBColor(0xF8, 0xFA, 0xFC)       # Clean Paper Off-White
CARD_BG = RGBColor(0xFF, 0xFF, 0xFF)        # Card Pure White
CARD_BORDER = RGBColor(0xE2, 0xE8, 0xF0)    # Subtle Slate Border

COLOR_TEAL = RGBColor(0x00, 0xC4, 0x9F)      # Accent Cyan / Teal
COLOR_ORANGE = RGBColor(0xFF, 0x99, 0x00)    # AWS Amber / Orange
COLOR_TEXT_DARK = RGBColor(0x0F, 0x17, 0x2A) # Slate 900
COLOR_TEXT_MUTED = RGBColor(0x64, 0x74, 0x8B) # Slate 500
COLOR_TEXT_LIGHT = RGBColor(0xF8, 0xFA, 0xFC) # Crisp White Text
COLOR_ACCENT_BLUE = RGBColor(0x3B, 0x82, 0xF6)

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"
FONT_MONO = "Consolas"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

def set_slide_background(slide, color):
    bg_shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = color
    bg_shape.line.fill.background()
    return bg_shape

def add_header(slide, kicker, title, subtitle=None, is_dark=False):
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    # Kicker
    p_kicker = tf.paragraphs[0]
    p_kicker.text = kicker.upper()
    p_kicker.font.name = FONT_MONO
    p_kicker.font.size = Pt(11)
    p_kicker.font.bold = True
    p_kicker.font.color.rgb = COLOR_TEAL if is_dark else COLOR_TEAL

    # Title
    p_title = tf.add_paragraph()
    p_title.text = title
    p_title.font.name = FONT_HEADING
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_TEXT_LIGHT if is_dark else COLOR_TEXT_DARK
    p_title.space_before = Pt(4)

    # Subtitle
    if subtitle:
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(13)
        p_sub.font.color.rgb = COLOR_TEXT_MUTED if not is_dark else RGBColor(0x94, 0xA3, 0xB8)
        p_sub.space_before = Pt(4)

def add_footer(slide, current_slide, total_slides=14, is_dark=False):
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.7), Inches(0.4))
    tf = tb.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = f"CloudDeploy · AWS ap-south-1 (Mumbai)"
    p.font.name = FONT_MONO
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(0x64, 0x74, 0x8B) if is_dark else RGBColor(0x94, 0xA3, 0xB8)

    # Slide Number on Right
    tb_num = slide.shapes.add_textbox(Inches(10.5), Inches(6.9), Inches(2.0), Inches(0.4))
    tf_num = tb_num.text_frame
    p_num = tf_num.paragraphs[0]
    p_num.alignment = PP_ALIGN.RIGHT
    p_num.text = f"{current_slide:02d} / {total_slides:02d}"
    p_num.font.name = FONT_MONO
    p_num.font.size = Pt(10)
    p_num.font.color.rgb = RGBColor(0x64, 0x74, 0x8B) if is_dark else RGBColor(0x94, 0xA3, 0xB8)

def add_module_slide(slide_num, kicker, title, subtitle, bullets, img_path):
    slide = prs.slides.add_slide(blank_layout)
    set_slide_background(slide, BG_LIGHT)
    add_header(slide, kicker, title, subtitle, is_dark=False)
    add_footer(slide, slide_num)

    # Left Column: Bullets
    left_box = slide.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(5.8), Inches(4.3))
    tf = left_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    for i, (lead, text) in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if i > 0:
            p.space_before = Pt(14)
        
        # Add visual bar marker
        r_bar = p.add_run()
        r_bar.text = "│ "
        r_bar.font.name = FONT_MONO
        r_bar.font.size = Pt(14)
        r_bar.font.bold = True
        r_bar.font.color.rgb = COLOR_TEAL

        r_lead = p.add_run()
        r_lead.text = f"{lead}: "
        r_lead.font.name = FONT_HEADING
        r_lead.font.size = Pt(13)
        r_lead.font.bold = True
        r_lead.font.color.rgb = COLOR_TEXT_DARK

        r_text = p.add_run()
        r_text.text = text
        r_text.font.name = FONT_BODY
        r_text.font.size = Pt(13)
        r_text.font.color.rgb = COLOR_TEXT_MUTED

    # Right Column: Image in card container
    if img_path and os.path.exists(img_path):
        card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(2.1), Inches(5.6), Inches(4.5)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        slide.shapes.add_picture(
            img_path, Inches(7.0), Inches(2.2), Inches(5.4), Inches(4.3)
        )

# ==============================================================================
# SLIDE 1: TITLE SLIDE (Dark Theme)
# ==============================================================================
slide1 = prs.slides.add_slide(blank_layout)
set_slide_background(slide1, BG_DARK)

tb1 = slide1.shapes.add_textbox(Inches(0.9), Inches(1.2), Inches(7.5), Inches(4.8))
tf1 = tb1.text_frame
tf1.word_wrap = True

p_k1 = tf1.paragraphs[0]
p_k1.text = "ADVANCED CLOUD ARCHITECTURE · AWS AP-SOUTH-1"
p_k1.font.name = FONT_MONO
p_k1.font.size = Pt(12)
p_k1.font.bold = True
p_k1.font.color.rgb = COLOR_TEAL

p_t1 = tf1.add_paragraph()
p_t1.text = "CloudDeploy"
p_t1.font.name = FONT_HEADING
p_t1.font.size = Pt(56)
p_t1.font.bold = True
p_t1.font.color.rgb = COLOR_TEXT_LIGHT
p_t1.space_before = Pt(8)

p_s1 = tf1.add_paragraph()
p_s1.text = "AWS-Native Multi-Tenant Static Website Deployment Platform"
p_s1.font.name = FONT_HEADING
p_s1.font.size = Pt(18)
p_s1.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
p_s1.space_before = Pt(6)

p_h1 = tf1.add_paragraph()
p_h1.text = "Zero server-side execution, sub-second atomic rollbacks & Origin Access Control."
p_h1.font.name = FONT_BODY
p_h1.font.size = Pt(13)
p_h1.font.color.rgb = COLOR_ORANGE
p_h1.space_before = Pt(12)

p_team = tf1.add_paragraph()
p_team.text = "Itishree Nayak (240714100014) · Akriti Mishra (240714100019)\nSoumya Ranjan Rout (240714100069) · Atyusha Mohanty (240714100073)\nSantanu Barik (240714100076) · K Sohan Patro (240714100111)"
p_team.font.name = FONT_BODY
p_team.font.size = Pt(11)
p_team.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)
p_team.space_before = Pt(16)

p_stack = tf1.add_paragraph()
p_stack.text = "AWS S3 · CloudFront OAC · Cognito · Spring Boot / FastAPI · React 18 · Tailwind · Docker"
p_stack.font.name = FONT_MONO
p_stack.font.size = Pt(10.5)
p_stack.font.color.rgb = COLOR_TEAL
p_stack.space_before = Pt(14)

# Preview picture on right
img1 = "screenshots/fig1_landing_hero.png"
if os.path.exists(img1):
    card1 = slide1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.3), Inches(1.5), Inches(4.3), Inches(4.4)
    )
    card1.fill.solid()
    card1.fill.fore_color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    card1.line.color.rgb = RGBColor(0x33, 0x41, 0x55)
    slide1.shapes.add_picture(img1, Inches(8.4), Inches(1.6), Inches(4.1), Inches(4.2))

# ==============================================================================
# SLIDE 2: INDEX (Light Theme)
# ==============================================================================
slide2 = prs.slides.add_slide(blank_layout)
set_slide_background(slide2, BG_LIGHT)
add_header(slide2, "CONTENTS", "Index", "Twelve content slides, from problem foundation to production viva defense")
add_footer(slide2, 2)

index_items = [
    ("03", "Problem Statement & Industry Gaps"),
    ("04", "Literature Review & Comparative Matrix"),
    ("05", "High-Performance System Architecture"),
    ("06", "Module 1 · Tenant Studio & Project Catalog"),
    ("07", "Module 2 · 14-Step Zip Ingestion Pipeline"),
    ("08", "Module 3 · FinOps & Real-Time Pricing Engine"),
    ("09", "Module 4 · CloudFront OAC & Zero-Trust Security"),
    ("10", "Module 5 · Sub-Second Atomic Rollback Engine"),
    ("11", "AWS Production Infrastructure & SRE"),
    ("12", "Step-by-Step Live Demo Walkthrough"),
    ("13", "Business Impact & Technical Defense"),
    ("14", "Project Summary & Discussion"),
]

for idx, (num, title) in enumerate(index_items):
    col = idx // 6
    row = idx % 6
    left = Inches(0.8 + col * 5.9)
    top = Inches(2.1 + row * 0.74)
    
    # White Card
    card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(5.6), Inches(0.64))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = CARD_BORDER
    card.line.width = Pt(1)

    # Accent Bar
    bar = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, left + Inches(0.12), top + Inches(0.14), Inches(0.06), Inches(0.36))
    bar.fill.solid()
    bar.fill.fore_color.rgb = COLOR_TEAL
    bar.line.fill.background()

    tb = slide2.shapes.add_textbox(left + Inches(0.3), top + Inches(0.1), Inches(5.1), Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    r_n = p.add_run()
    r_n.text = f"{num}   "
    r_n.font.name = FONT_MONO
    r_n.font.bold = True
    r_n.font.size = Pt(13)
    r_n.font.color.rgb = COLOR_TEAL

    r_t = p.add_run()
    r_t.text = title
    r_t.font.name = FONT_HEADING
    r_t.font.size = Pt(12)
    r_t.font.bold = True
    r_t.font.color.rgb = COLOR_TEXT_DARK

# ==============================================================================
# SLIDE 3: PROBLEM STATEMENT (Light Theme)
# ==============================================================================
slide3 = prs.slides.add_slide(blank_layout)
set_slide_background(slide3, BG_LIGHT)
add_header(slide3, "PROBLEM STATEMENT", "The Static Web Deployment Bottleneck", "Three foundational flaws in existing cloud deployment workflows")
add_footer(slide3, 3)

problems = [
    ("01", "Severe Cost Overhead & Vendor Lock-In", "Commercial platforms charge $20-$100/mo for basic team seats and slap 300%+ markups over raw AWS bandwidth, penalizing growing traffic."),
    ("02", "Public Bucket Leaks & OAI Deprecation", "Legacy setups rely on vulnerable public S3 website endpoints or deprecated Origin Access Identity (OAI), exposing raw object stores to open internet."),
    ("03", "Destructive Overwrite Deployments", "Traditional FTP or manual S3 syncing mutates objects in-place without version isolation, causing broken assets, 404 caching cascades, and slow recovery.")
]

for idx, (num, title, desc) in enumerate(problems):
    left = Inches(0.8 + idx * 3.95)
    card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(2.2), Inches(3.8), Inches(3.6))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = CARD_BORDER
    card.line.width = Pt(1)

    tb = slide3.shapes.add_textbox(left + Inches(0.3), Inches(2.4), Inches(3.2), Inches(3.2))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p_num = tf.paragraphs[0]
    p_num.text = num
    p_num.font.name = FONT_MONO
    p_num.font.bold = True
    p_num.font.size = Pt(16)
    p_num.font.color.rgb = COLOR_TEAL

    p_t = tf.add_paragraph()
    p_t.text = title
    p_t.font.name = FONT_HEADING
    p_t.font.bold = True
    p_t.font.size = Pt(14)
    p_t.font.color.rgb = COLOR_TEXT_DARK
    p_t.space_before = Pt(8)

    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(12)
    p_d.font.color.rgb = COLOR_TEXT_MUTED
    p_d.space_before = Pt(8)

# Bottom Callout Banner
callout_tb = slide3.shapes.add_textbox(Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.6))
callout_tf = callout_tb.text_frame
p_call = callout_tf.paragraphs[0]
p_call.text = "CloudDeploy eliminates all three with zero-server execution, SigV4 Origin Access Control, and sub-second atomic pointer updates."
p_call.font.name = FONT_HEADING
p_call.font.bold = True
p_call.font.size = Pt(13)
p_call.font.color.rgb = COLOR_TEAL

# ==============================================================================
# SLIDE 4: LITERATURE REVIEW & COMPARATIVE MATRIX (Light Theme)
# ==============================================================================
slide4 = prs.slides.add_slide(blank_layout)
set_slide_background(slide4, BG_LIGHT)
add_header(slide4, "LITERATURE REVIEW", "Comparative Engineering Benchmarks", "Evaluating deployment paradigms across commercial SaaS, manual AWS, and CloudDeploy")
add_footer(slide4, 4)

table_shape = slide4.shapes.add_table(7, 5, Inches(0.8), Inches(2.2), Inches(11.7), Inches(4.0))
table = table_shape.table

headers = ["Architectural Dimension", "Vercel / Netlify", "AWS S3 Static Web", "Traditional VPS", "CloudDeploy (Ours)"]
rows_data = [
    ["Execution Model", "Serverless / Node Runtime", "Serverless Object Store", "Dedicated Virtual Server", "Zero-Server Pure Edge (OAC)"],
    ["Access Security", "Proprietary Edge Shield", "Public Read Bucket Policy", "Firewall / SSH Port Open", "Private S3 + CloudFront SigV4"],
    ["Rollback Latency", "30-90 s (Trigger Rebuild)", "Destructive (Re-upload files)", "Minutes (Git pull/build)", "< 850 ms (Pointer Redirect)"],
    ["FinOps Pricing", "Aggressive Tier Markups", "Raw AWS Rate (No UI)", "Fixed Idle Server Cost", "Live AWS Cost Engine ($ & INR)"],
    ["Atomic Versioning", "Git Commit Driven", "None (Direct In-Place)", "Directory Swapping", "UUID Prefix Namespacing"],
    ["Operational Burden", "Low (Black Box)", "High (Console Manual)", "High (Sysadmin/Updates)", "Zero (Autonomous Pipeline)"]
]

for col_idx, h in enumerate(headers):
    cell = table.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(0x0F, 0x17, 0x2A) if col_idx != 4 else RGBColor(0x00, 0x8C, 0x72)
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.name = FONT_HEADING
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_TEXT_LIGHT

for row_idx, r_data in enumerate(rows_data):
    for col_idx, val in enumerate(r_data):
        cell = table.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        if col_idx == 4:
            cell.fill.fore_color.rgb = RGBColor(0xEC, 0xFD, 0xF5) # subtle emerald tint
        else:
            cell.fill.fore_color.rgb = CARD_BG if row_idx % 2 == 0 else RGBColor(0xF1, 0xF5, 0xF9)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(10.5)
        p.font.color.rgb = RGBColor(0x06, 0x5F, 0x46) if col_idx == 4 else COLOR_TEXT_DARK
        if col_idx == 4 or col_idx == 0:
            p.font.bold = True

# Bottom citation
cit_tb = slide4.shapes.add_textbox(Inches(0.8), Inches(6.35), Inches(11.7), Inches(0.4))
cit_p = cit_tb.text_frame.paragraphs[0]
cit_p.text = "Grounded in: AWS Well-Architected Framework · CIS AWS Foundations v3.0 · NIST SP 800-207 (Zero Trust) · FinOps Foundation Specification"
cit_p.font.name = FONT_MONO
cit_p.font.size = Pt(9.5)
cit_p.font.color.rgb = COLOR_TEXT_MUTED

# ==============================================================================
# SLIDE 5: SYSTEM ARCHITECTURE (Dark Theme)
# ==============================================================================
slide5 = prs.slides.add_slide(blank_layout)
set_slide_background(slide5, BG_DARK)
add_header(slide5, "PLATFORM ARCHITECTURE · 3-TIER WITH MULTI-TENANT ISOLATION", "High-Performance Cloud Architecture", "Edge-optimized delivery plane paired with autonomous orchestration engine", is_dark=True)
add_footer(slide5, 5, is_dark=True)

arch_tiers = [
    ("Client Tier", "React 18 + Tailwind CSS single page console with Lucide icons, SSE event stream listeners, and 0.5 s client zip verification."),
    ("Gateway Tier", "NGINX 1.25+ reverse proxy enforcing Let's Encrypt TLS 1.3, rate-limiting, and 50 MB streaming zip buffers with zero disk leak."),
    ("Core Backend", "Spring Boot / FastAPI asynchronous control plane with JPA repository isolation, connection pooling, and multi-tenant quotas."),
    ("Storage Tier", "Amazon S3 dual-bucket partition: private upload intake vault and immutable prefix namespaced production hosting bucket."),
    ("Edge Plane", "Amazon CloudFront Global CDN terminating HTTPS, executing OAC SigV4 signed requests, and sub-second TTL cache invalidation.")
]

tb_arch = slide5.shapes.add_textbox(Inches(0.8), Inches(2.1), Inches(6.0), Inches(4.5))
tf_arch = tb_arch.text_frame
tf_arch.word_wrap = True

for i, (tier, desc) in enumerate(arch_tiers):
    p = tf_arch.paragraphs[0] if i == 0 else tf_arch.add_paragraph()
    if i > 0:
        p.space_before = Pt(12)
    
    r_tag = p.add_run()
    r_tag.text = f"{tier}: "
    r_tag.font.name = FONT_HEADING
    r_tag.font.bold = True
    r_tag.font.size = Pt(12.5)
    r_tag.font.color.rgb = COLOR_TEAL

    r_desc = p.add_run()
    r_desc.text = desc
    r_desc.font.name = FONT_BODY
    r_desc.font.size = Pt(12)
    r_desc.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)

# Diagram picture on right
diag_path = "diagrams/fig1_system_topology.png"
if os.path.exists(diag_path):
    card5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(2.0), Inches(5.5), Inches(4.6))
    card5.fill.solid()
    card5.fill.fore_color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    card5.line.color.rgb = RGBColor(0x33, 0x41, 0x55)
    slide5.shapes.add_picture(diag_path, Inches(7.1), Inches(2.1), Inches(5.3), Inches(4.4))

# ==============================================================================
# SLIDES 6 - 10: CORE MODULES (Light Theme with UI Screenshots)
# ==============================================================================
# Module 1: Projects & Studio
add_module_slide(
    slide_num=6,
    kicker="MODULE 1",
    title="Tenant Console & Project Management",
    subtitle="Centralized management hub for multi-tenant static applications",
    bullets=[
        ("Multi-Project Organization", "Independent namespace isolation per application with custom slugs, environment tags, and deployment counters."),
        ("One-Click Provisioning", "Instant site scaffolding linked to isolated S3 sub-paths without cloud infrastructure friction."),
        ("Real-Time Telemetry", "Live build metrics, deployment duration tracking, and instant production health status indicators."),
        ("Granular Tenant Quotas", "Configurable limits on total sites, storage allocations, and monthly bandwidth caps per tenant account.")
    ],
    img_path="screenshots/fig8_projects_catalog.png"
)

# Module 2: Ingestion & Pipeline
add_module_slide(
    slide_num=7,
    kicker="MODULE 2",
    title="14-Step Zip Ingestion Pipeline",
    subtitle="Automated, memory-buffered extraction and recursive S3 object deployment",
    bullets=[
        ("Client-Side Zip Inspection", "Validates archive structure, entry point (`index.html`), and malicious directory traversal patterns prior to transmission."),
        ("Streaming Buffer Unzipping", "Memory-buffered chunk parsing prevents disk-space saturation and executes concurrent uploads to Amazon S3."),
        ("MIME-Type Resolution", "Precise heuristic mapping across 40+ web extensions ensuring accurate `Content-Type` headers for browsers."),
        ("Real-Time Build Feedback", "Server-Sent Events (SSE) stream terminal progress step-by-step straight to the user interface in real time.")
    ],
    img_path="screenshots/fig10_upload_deploy_zone.png"
)

# Module 3: FinOps & Pricing
add_module_slide(
    slide_num=8,
    kicker="MODULE 3",
    title="FinOps & Interactive Cost Intelligence",
    subtitle="Service-level cost estimation aligned with real-time AWS pricing",
    bullets=[
        ("Granular AWS Pricing Models", "Accurately calculates S3 Standard storage ($0.023/GB), CloudFront data egress ($0.085/GB), and Route 53 queries."),
        ("Dual Currency Projection", "Instant toggle between USD ($) and INR (₹) at live exchange rates tailored for AWS Mumbai (ap-south-1)."),
        ("Interactive Traffic Sliders", "Simulate monthly visitor surges from 1,000 to 10,000,000 requests to forecast cloud infrastructure spend."),
        ("Tier Comparison Engine", "Side-by-side economic analysis proving 70-85% cost savings compared to traditional commercial SaaS vendors.")
    ],
    img_path="screenshots/fig3_pricing_finops.png"
)

# Module 4: Security & OAC
add_module_slide(
    slide_num=9,
    kicker="MODULE 4",
    title="CloudFront OAC & Zero-Trust Security",
    subtitle="Enforcing strict origin protection and eliminating public bucket exposure",
    bullets=[
        ("Origin Access Control (OAC)", "Implements AWS SigV4 cryptographic signing between CloudFront and S3, completely closing public internet bucket ingress."),
        ("Automated IAM Least Privilege", "Generates mathematically constrained S3 bucket policies permitting reads exclusively from the specific CloudFront ARN."),
        ("Amazon Cognito Authentication", "JWT bearer token verification, SRP secure password transmission, and role-based access control (USER / ADMIN)."),
        ("Compliance Audit Ready", "Fully conforms to CIS AWS Foundations Benchmark v3.0 (Rule 2.1.5: S3 Block Public Access).")
    ],
    img_path="screenshots/fig9_project_detail_active.png"
)

# Module 5: Atomic Rollback Engine
add_module_slide(
    slide_num=10,
    kicker="MODULE 5",
    title="Sub-Second Atomic Rollback Engine",
    subtitle="Zero-downtime version switching through immutable S3 prefix routing",
    bullets=[
        ("Immutable Prefix Architecture", "Every build is archived in an immutable `site-id/deployments/{UUID}/` path, guaranteeing zero destructive overwrites."),
        ("Sub-Second Pointer Reassignment", "Rollbacks update the relational metadata pointer in < 850 ms without re-uploading files or invalidating entire caches."),
        ("Deployment Audit Ledger", "Comprehensive history retaining Git SHA tags, file counts, payload sizes, and deployment author timestamps."),
        ("Emergency Failover Safety", "Instant one-click rollback restores previous stable production state immediately if a defect is introduced.")
    ],
    img_path="screenshots/fig11_deployment_history_rollback.png"
)

# ==============================================================================
# SLIDE 11: INFRASTRUCTURE & SRE (Light Theme with UI Screenshot)
# ==============================================================================
slide11 = prs.slides.add_slide(blank_layout)
set_slide_background(slide11, BG_LIGHT)
add_header(slide11, "PRODUCTION AWS DEPLOYMENT · ZERO-TRUST ARCHITECTURE", "Cloud Infrastructure and SRE Engineering", "Resilient containerized control plane orchestrating AWS-native edge delivery")
add_footer(slide11, 11)

sre_bullets = [
    ("Dual-Tier Storage Strategy", "High-throughput staging bucket for intake unzipping paired with immutable, versioned production site bucket."),
    ("Edge Cache Optimization", "CloudFront distribution with customized cache behaviors, HTTP/3 support, and gzip/brotli auto-compression."),
    ("Containerized Microservices", "Docker Compose stack deploying NGINX 1.25+, control plane backend, and React 18 client on AWS compute."),
    ("Operational Observability", "Real-time CloudWatch metrics, structured application logging, and automated SNS alerting for failed uploads."),
    ("Cost Teardown Automation", "Automated cleanup scripts release idle Elastic IPs and orphaned S3 staging objects to prevent cost leaks.")
]

tb11 = slide11.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(5.8), Inches(4.3))
tf11 = tb11.text_frame
tf11.word_wrap = True

for i, (lead, text) in enumerate(sre_bullets):
    p = tf11.paragraphs[0] if i == 0 else tf11.add_paragraph()
    if i > 0:
        p.space_before = Pt(12)
    r_bar = p.add_run()
    r_bar.text = "│ "
    r_bar.font.name = FONT_MONO
    r_bar.font.size = Pt(13)
    r_bar.font.bold = True
    r_bar.font.color.rgb = COLOR_TEAL

    r_lead = p.add_run()
    r_lead.text = f"{lead}: "
    r_lead.font.name = FONT_HEADING
    r_lead.font.size = Pt(12.5)
    r_lead.font.bold = True
    r_lead.font.color.rgb = COLOR_TEXT_DARK

    r_text = p.add_run()
    r_text.text = text
    r_text.font.name = FONT_BODY
    r_text.font.size = Pt(12)
    r_text.font.color.rgb = COLOR_TEXT_MUTED

img_admin = "screenshots/fig13_admin_overview.png"
if os.path.exists(img_admin):
    card11 = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(2.1), Inches(5.6), Inches(4.5))
    card11.fill.solid()
    card11.fill.fore_color.rgb = CARD_BG
    card11.line.color.rgb = CARD_BORDER
    slide11.shapes.add_picture(img_admin, Inches(7.0), Inches(2.2), Inches(5.4), Inches(4.3))

# ==============================================================================
# SLIDE 12: LIVE DEMO WALKTHROUGH (Light Theme with Gallery)
# ==============================================================================
slide12 = prs.slides.add_slide(blank_layout)
set_slide_background(slide12, BG_LIGHT)
add_header(slide12, "LIVE DEMO WORKFLOW", "Step-by-Step Platform Walkthrough", "From raw static code bundle to global HTTPS CDN deployment in six steps")
add_footer(slide12, 12)

table_demo = slide12.shapes.add_table(7, 3, Inches(0.8), Inches(2.1), Inches(11.7), Inches(2.7)).table
demo_headers = ["Step", "Platform Module", "Action Executed & System Capability Demonstrated"]
demo_steps = [
    ["1", "Authentication", "Sign in via Cognito multi-tenant console or launch instant verified demo session."],
    ["2", "Project Creation", "Initialize 'Atelier Portfolio' static site entity with auto-assigned slug and S3 prefix."],
    ["3", "Zip Upload & Ingest", "Drag-and-drop web archive; streaming unzipper parses and pushes assets directly to S3."],
    ["4", "OAC Verification", "Inspect CloudFront SigV4 security headers; verify raw S3 bucket direct access is blocked (403)."],
    ["5", "FinOps Calculation", "Open FinOps simulator; toggle USD/INR and project bandwidth spend under 1M monthly visits."],
    ["6", "Sub-Second Rollback", "Trigger rollback to v2; verify sub-second pointer update (< 850 ms) without re-uploading."]
]

for col_idx, h in enumerate(demo_headers):
    cell = table_demo.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.name = FONT_HEADING
    p.font.bold = True
    p.font.size = Pt(10)
    p.font.color.rgb = COLOR_TEXT_LIGHT

for r_idx, step_data in enumerate(demo_steps):
    for c_idx, val in enumerate(step_data):
        cell = table_demo.cell(r_idx + 1, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG if r_idx % 2 == 0 else RGBColor(0xF8, 0xFA, 0xFC)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_TEXT_DARK
        if c_idx == 0:
            p.font.name = FONT_MONO
            p.font.bold = True
            p.font.color.rgb = COLOR_TEAL

# Bottom Thumbnail Carousel
gallery_imgs = [
    ("Step 1: Auth", "screenshots/fig6_auth_login.png"),
    ("Step 2: Projects", "screenshots/fig8_projects_catalog.png"),
    ("Step 3: Ingestion", "screenshots/fig10_upload_deploy_zone.png"),
    ("Step 4: Rollback", "screenshots/fig11_deployment_history_rollback.png"),
    ("Step 5: FinOps", "screenshots/fig3_pricing_finops.png")
]

for g_idx, (g_title, g_path) in enumerate(gallery_imgs):
    g_left = Inches(0.8 + g_idx * 2.38)
    g_top = Inches(5.1)
    if os.path.exists(g_path):
        card_g = slide12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, g_left, g_top, Inches(2.25), Inches(1.5))
        card_g.fill.solid()
        card_g.fill.fore_color.rgb = CARD_BG
        card_g.line.color.rgb = CARD_BORDER
        slide12.shapes.add_picture(g_path, g_left + Inches(0.05), g_top + Inches(0.05), Inches(2.15), Inches(1.2))

        tb_gt = slide12.shapes.add_textbox(g_left, g_top + Inches(1.25), Inches(2.25), Inches(0.25))
        p_gt = tb_gt.text_frame.paragraphs[0]
        p_gt.alignment = PP_ALIGN.CENTER
        p_gt.text = g_title
        p_gt.font.name = FONT_MONO
        p_gt.font.size = Pt(8.5)
        p_gt.font.bold = True
        p_gt.font.color.rgb = COLOR_TEXT_DARK

# ==============================================================================
# SLIDE 13: BUSINESS IMPACT & VIVA DEFENSE (Dark Theme)
# ==============================================================================
slide13 = prs.slides.add_slide(blank_layout)
set_slide_background(slide13, BG_DARK)
add_header(slide13, "IMPACT, ROADMAP AND VIVA DEFENSE", "Business Impact and Technical Defense", "Demonstrated engineering metrics and core viva defense questions", is_dark=True)
add_footer(slide13, 13, is_dark=True)

# 3 Stat Counters
stats = [
    ("78%", "Hosting Cost Reduction", "Versus commercial SaaS platforms by utilizing raw AWS infrastructure pricing without markups."),
    ("< 850ms", "Atomic Rollback Speed", "Achieved by redirecting metadata pointers without modifying or re-uploading S3 objects."),
    ("100%", "Zero Public S3 Exposure", "All origin buckets are private; accessed exclusively via SigV4 signed CloudFront OAC tokens.")
]

for s_idx, (num, label, desc) in enumerate(stats):
    s_left = Inches(0.8 + s_idx * 3.95)
    s_card = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, s_left, Inches(1.9), Inches(3.8), Inches(1.8))
    s_card.fill.solid()
    s_card.fill.fore_color.rgb = RGBColor(0x13, 0x1C, 0x2E)
    s_card.line.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    s_tb = slide13.shapes.add_textbox(s_left + Inches(0.2), Inches(2.0), Inches(3.4), Inches(1.6))
    s_tf = s_tb.text_frame
    s_tf.word_wrap = True

    p_num = s_tf.paragraphs[0]
    p_num.text = num
    p_num.font.name = FONT_HEADING
    p_num.font.bold = True
    p_num.font.size = Pt(32)
    p_num.font.color.rgb = COLOR_TEAL

    p_lbl = s_tf.add_paragraph()
    p_lbl.text = label
    p_lbl.font.name = FONT_HEADING
    p_lbl.font.bold = True
    p_lbl.font.size = Pt(12)
    p_lbl.font.color.rgb = COLOR_TEXT_LIGHT
    p_lbl.space_before = Pt(2)

    p_dsc = s_tf.add_paragraph()
    p_dsc.text = desc
    p_dsc.font.name = FONT_BODY
    p_dsc.font.size = Pt(10)
    p_dsc.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    p_dsc.space_before = Pt(4)

# Viva Q&A
viva_qa = [
    ("Q1. Why is CloudDeploy an Advanced Cloud Architecture project?",
     "It integrates 6 AWS services natively (S3, CloudFront, Cognito, Route 53, CloudWatch, Secrets Manager) with SigV4 Origin Access Control and streaming in-memory pipeline orchestration."),
    ("Q2. Why Origin Access Control (OAC) instead of legacy Origin Access Identity (OAI)?",
     "OAC supports AWS Signature Version 4 (SigV4), all S3 buckets in all AWS regions, server-side encryption with AWS KMS (SSE-KMS), and dynamic policy permissions that OAI lacks."),
    ("Q3. How do atomic rollbacks complete in under 850 milliseconds?",
     "Builds are stored in immutable prefix folders (`site-id/deployments/{UUID}/`). Rolling back only modifies the database active pointer record; zero files are transferred or re-uploaded.")
]

tb_viva = slide13.shapes.add_textbox(Inches(0.8), Inches(4.0), Inches(11.7), Inches(2.5))
tf_viva = tb_viva.text_frame
tf_viva.word_wrap = True

for q_idx, (q, a) in enumerate(viva_qa):
    p_q = tf_viva.paragraphs[0] if q_idx == 0 else tf_viva.add_paragraph()
    if q_idx > 0:
        p_q.space_before = Pt(8)
    
    r_q = p_q.add_run()
    r_q.text = f"{q} "
    r_q.font.name = FONT_HEADING
    r_q.font.bold = True
    r_q.font.size = Pt(11)
    r_q.font.color.rgb = COLOR_ORANGE

    r_a = p_q.add_run()
    r_a.text = a
    r_a.font.name = FONT_BODY
    r_a.font.size = Pt(10.5)
    r_a.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)

# ==============================================================================
# SLIDE 14: THANK YOU (Dark Theme)
# ==============================================================================
slide14 = prs.slides.add_slide(blank_layout)
set_slide_background(slide14, BG_DARK)

tb14 = slide14.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(4.5))
tf14 = tb14.text_frame
tf14.word_wrap = True

p_k14 = tf14.paragraphs[0]
p_k14.text = "CLOUDDEPLOY · AWS-NATIVE MULTI-TENANT STATIC PLATFORM"
p_k14.font.name = FONT_MONO
p_k14.font.size = Pt(13)
p_k14.font.bold = True
p_k14.font.color.rgb = COLOR_TEAL

p_t14 = tf14.add_paragraph()
p_t14.text = "Thank You"
p_t14.font.name = FONT_HEADING
p_t14.font.size = Pt(64)
p_t14.font.bold = True
p_t14.font.color.rgb = COLOR_TEXT_LIGHT
p_t14.space_before = Pt(8)

p_s14 = tf14.add_paragraph()
p_s14.text = "Questions, viva defense & architectural discussion welcome."
p_s14.font.name = FONT_BODY
p_s14.font.size = Pt(20)
p_s14.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
p_s14.space_before = Pt(8)

# Decorative Line
line = slide14.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(4.2), Inches(2.0), Inches(0.04))
line.fill.solid()
line.fill.fore_color.rgb = COLOR_TEAL
line.line.fill.background()

p_auth = tf14.add_paragraph()
p_auth.text = "Itishree Nayak (240714100014) · Akriti Mishra (240714100019) · Soumya Ranjan Rout (240714100069)\nAtyusha Mohanty (240714100073) · Santanu Barik (240714100076) · K Sohan Patro (240714100111)\nDepartment of Computer Applications · Centurion University of Technology and Management, Odisha"
p_auth.font.name = FONT_BODY
p_auth.font.size = Pt(12)
p_auth.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)
p_auth.space_before = Pt(32)

add_footer(slide14, 14, is_dark=True)

# Save
output_pptx = "CloudDeploy_Presentation.pptx"
prs.save(output_pptx)
print(f"Successfully generated 14-slide presentation: {output_pptx}")

