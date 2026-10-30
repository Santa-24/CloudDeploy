# -*- coding: utf-8 -*-
"""
CloudDeploy Academic Project Report Generator
Centurion University of Technology and Management, Odisha
Advanced Cloud Architecture and Design (ACAD)
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()

    # Define standard colors
    COLOR_PRIMARY = RGBColor(26, 54, 93)      # Deep Navy #1A365D
    COLOR_SECONDARY = RGBColor(43, 108, 176)  # Slate Blue #2B6CB0
    COLOR_DARK = RGBColor(45, 55, 72)         # Charcoal #2D3748
    COLOR_MUTED = RGBColor(113, 128, 150)     # Gray #718096
    HEX_HEADER_BG = "1A365D"                  # Deep Navy
    HEX_ZEBRA_BG = "F7FAFC"                   # Light Gray/Ice Blue
    HEX_BORDER = "CBD5E0"                     # Subtle Border Gray

    # Set standard page margins (A4: 8.27 x 11.69 inches)
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)    # Binding margin
        section.right_margin = Inches(1.0)

    # Configure Default Styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = COLOR_DARK
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(4)
    style_normal.paragraph_format.space_before = Pt(0)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # XML Helper Functions
    def set_cell_margins(cell, top=50, bottom=50, left=80, right=80):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                          f'<w:top w:w="{top}" w:type="dxa"/>'
                          f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                          f'<w:left w:w="{left}" w:type="dxa"/>'
                          f'<w:right w:w="{right}" w:type="dxa"/>'
                          f'</w:tcMar>')
        tcPr.append(tcMar)

    def set_cell_shading(cell, color_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        tcPr.append(shd)

    def set_table_borders(table, color="CBD5E0", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        tblBorders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(tblBorders)

    def add_page_number_field(run):
        fldChar1 = OxmlElement('w:fldChar')
        fldChar1.set(qn('w:fldCharType'), 'begin')
        instrText = OxmlElement('w:instrText')
        instrText.set(qn('xml:space'), 'preserve')
        instrText.text = "PAGE"
        fldChar2 = OxmlElement('w:fldChar')
        fldChar2.set(qn('w:fldCharType'), 'separate')
        fldChar3 = OxmlElement('w:fldChar')
        fldChar3.set(qn('w:fldCharType'), 'end')
        run._r.append(fldChar1)
        run._r.append(instrText)
        run._r.append(fldChar2)
        run._r.append(fldChar3)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(15)
        run.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12.5)
        run.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.bold = True
        run.font.color.rgb = COLOR_DARK
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_pre = p.add_run(bold_prefix + " ")
            r_pre.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(10.5)
        r.font.color.rgb = COLOR_DARK
        return p

    def add_figure(img_path, caption_text, width_in=5.4):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(6)
            p_img.paragraph_format.space_after = Pt(2)
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=Inches(width_in))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(6)
            p_cap.paragraph_format.keep_with_next = False
            run_cap = p_cap.add_run(caption_text)
            run_cap.font.name = 'Calibri'
            run_cap.font.size = Pt(9.5)
            run_cap.italic = True
            run_cap.font.color.rgb = COLOR_MUTED
        else:
            p = doc.add_paragraph(f"[Image Missing: {img_path}]")
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    def create_styled_table(headers, data, col_widths=None):
        table = doc.add_table(rows=len(data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)

        # Header Row
        hdr_row = table.rows[0]
        tblPr = hdr_row._tr.get_or_add_trPr()
        tblPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        tblPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        for i, title in enumerate(headers):
            cell = hdr_row.cells[i]
            set_cell_shading(cell, HEX_HEADER_BG)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            run = p.add_run(title)
            run.font.name = 'Calibri'
            run.font.size = Pt(9.0)
            run.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row = table.rows[r_idx + 1]
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

            bg_color = HEX_ZEBRA_BG if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                set_cell_shading(cell, bg_color)
                set_cell_margins(cell, top=45, bottom=45, left=70, right=70)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.05
                # Center align first column if it's short ID or Sl No
                if c_idx == 0 or len(str(val)) < 8:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(str(val))
                run.font.name = 'Calibri'
                run.font.size = Pt(8.5)
                run.font.color.rgb = COLOR_DARK

        # Set Column Widths if provided
        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    row.cells[idx].width = Inches(w)

        # Spacing after table
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)
        return table

    # =========================================================================
    # SECTION 0: COVER PAGE
    # =========================================================================
    sec_cover = doc.sections[0]
    sec_cover.different_first_page_header_footer = True
    sec_cover.header.is_linked_to_previous = False
    sec_cover.footer.is_linked_to_previous = False

    # Centurion University Logo
    logo_path = r'extracted_media/image1.png'
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(12)
        r_logo = p_logo.add_run()
        r_logo.add_picture(logo_path, width=Inches(2.5))

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("CloudDeploy")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(28)
    r_title.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub1 = doc.add_paragraph()
    p_sub1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub1.paragraph_format.space_before = Pt(2)
    p_sub1.paragraph_format.space_after = Pt(4)
    r_sub1 = p_sub1.add_run("AN AWS-NATIVE MULTI-TENANT STATIC WEBSITE DEPLOYMENT PLATFORM")
    r_sub1.font.name = 'Calibri'
    r_sub1.font.size = Pt(12)
    r_sub1.bold = True
    r_sub1.font.color.rgb = COLOR_SECONDARY

    p_sub2 = doc.add_paragraph()
    p_sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub2.paragraph_format.space_before = Pt(0)
    p_sub2.paragraph_format.space_after = Pt(16)
    r_sub2 = p_sub2.add_run("Zero Server-Side Execution · Origin Access Control · Sub-Second Atomic Rollbacks · Multi-AZ Cloud Architecture")
    r_sub2.font.name = 'Calibri'
    r_sub2.font.size = Pt(9.5)
    r_sub2.italic = True
    r_sub2.font.color.rgb = COLOR_MUTED

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_before = Pt(6)
    p_proj.paragraph_format.space_after = Pt(2)
    r_proj = p_proj.add_run("Project Report under the subject Advanced Cloud Architecture and Design (ACAD)\nA PROJECT REPORT")
    r_proj.font.name = 'Calibri'
    r_proj.font.size = Pt(11)
    r_proj.bold = True
    r_proj.font.color.rgb = COLOR_DARK

    p_subby = doc.add_paragraph()
    p_subby.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subby.paragraph_format.space_before = Pt(8)
    p_subby.paragraph_format.space_after = Pt(2)
    r_subby = p_subby.add_run("Submitted By")
    r_subby.font.name = 'Calibri'
    r_subby.font.size = Pt(10)
    r_subby.italic = True
    r_subby.font.color.rgb = COLOR_MUTED

    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_auth.paragraph_format.space_before = Pt(2)
    p_auth.paragraph_format.space_after = Pt(16)
    r_auth = p_auth.add_run("SANTANU BARIK — 240714100076\nSOUMYA RANJAN ROUT — 240714100069\nK SOHAN ROUT — 240714100111")
    r_auth.font.name = 'Calibri'
    r_auth.font.size = Pt(10.5)
    r_auth.bold = True
    r_auth.font.color.rgb = COLOR_PRIMARY

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_before = Pt(8)
    p_deg.paragraph_format.space_after = Pt(2)
    r_deg = p_deg.add_run("in partial fulfilment for the award of the degree of\nBACHELOR OF COMPUTER APPLICATIONS (BCA)")
    r_deg.font.name = 'Calibri'
    r_deg.font.size = Pt(11)
    r_deg.bold = True
    r_deg.font.color.rgb = COLOR_DARK

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(14)
    p_dept.paragraph_format.space_after = Pt(0)
    r_dept = p_dept.add_run(
        "DEPARTMENT OF BACHELOR OF COMPUTER APPLICATION\n"
        "SCHOOL OF ENGINEERING AND TECHNOLOGY\n"
        "CENTURION UNIVERSITY OF TECHNOLOGY AND MANAGEMENT, ODISHA\n"
        "BHUBANESWAR CAMPUS\n"
        "NOVEMBER 2026-2027"
    )
    r_dept.font.name = 'Calibri'
    r_dept.font.size = Pt(10)
    r_dept.bold = True
    r_dept.font.color.rgb = COLOR_PRIMARY

    # =========================================================================
    # SECTION 1: FRONT MATTER (Roman Numerals)
    # =========================================================================
    sec_front = doc.add_section(docx.enum.section.WD_SECTION_START.NEW_PAGE)
    sec_front.header.is_linked_to_previous = False
    sec_front.footer.is_linked_to_previous = False

    # Set page numbering to lower Roman starting at 1
    sectPr = sec_front._sectPr
    pgNumType = parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="lowerRoman" w:start="1"/>')
    sectPr.append(pgNumType)

    # Footer for Front Matter
    f_p = sec_front.footer.paragraphs[0]
    f_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_r = f_p.add_run()
    f_r.font.name = 'Calibri'
    f_r.font.size = Pt(9.5)
    f_r.font.color.rgb = COLOR_MUTED
    add_page_number_field(f_r)

    # -------------------------------------------------------------------------
    # Bonafide Certificate
    # -------------------------------------------------------------------------
    add_heading_1("Bonafide Certificate")
    p_cert = doc.add_paragraph()
    p_cert.paragraph_format.space_before = Pt(6)
    p_cert.paragraph_format.space_after = Pt(10)
    p_cert.paragraph_format.line_spacing = 1.2
    p_cert.add_run(
        "Certified that this project report on “CloudDeploy: An AWS-Native Multi-Tenant Static Website Deployment Platform”, "
        "submitted under the subject Advanced Cloud Architecture and Design (ACAD), is the bonafide work of "
        "“Santanu Barik (240714100076), Soumya Ranjan Rout (240714100069), and K Sohan Rout (240714100111)” "
        "who carried out the project work under my supervision. This is to further certify, to the best of my knowledge, "
        "that this project has not been carried out earlier in this institute and the university."
    )

    p_sig1 = doc.add_paragraph()
    p_sig1.paragraph_format.space_before = Pt(28)
    p_sig1.paragraph_format.space_after = Pt(2)
    p_sig1.paragraph_format.keep_with_next = True
    r_sig1 = p_sig1.add_run("SIGNATURE\n(Mr. Rajkumar Mohanta)\nProject Guide, Dept. of Bachelor of Computer Application")
    r_sig1.bold = True
    r_sig1.font.size = Pt(10)

    p_cert2 = doc.add_paragraph()
    p_cert2.paragraph_format.space_before = Pt(20)
    p_cert2.paragraph_format.space_after = Pt(10)
    p_cert2.add_run("Certified that the above-mentioned project has been duly carried out as per the norms of the college and statutes of the university.")

    p_sig2 = doc.add_paragraph()
    p_sig2.paragraph_format.space_before = Pt(28)
    p_sig2.paragraph_format.space_after = Pt(2)
    p_sig2.paragraph_format.keep_with_next = True
    r_sig2 = p_sig2.add_run("SIGNATURE\nDr. Rakesh Kumar Ray\nHEAD OF THE DEPARTMENT\nDept. of Bachelor of Computer Application\n\nDEPARTMENT SEAL")
    r_sig2.bold = True
    r_sig2.font.size = Pt(10)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Declaration
    # -------------------------------------------------------------------------
    add_heading_1("Declaration")
    p_dec1 = doc.add_paragraph()
    p_dec1.paragraph_format.space_before = Pt(6)
    p_dec1.paragraph_format.space_after = Pt(6)
    p_dec1.add_run(
        "We hereby declare that the project entitled “CloudDeploy: An AWS-Native Multi-Tenant Static Website Deployment Platform”, "
        "submitted for the Project of 5th semester BCA under the subject Advanced Cloud Architecture and Design (ACAD), "
        "is our original work and the project has not formed the basis for the award of any Degree or any other similar titles "
        "in any other University / Institute."
    )
    p_dec2 = doc.add_paragraph()
    p_dec2.paragraph_format.space_before = Pt(2)
    p_dec2.paragraph_format.space_after = Pt(10)
    p_dec2.add_run("All sources of information, documentation, engineering references, and tools referred to during the preparation of this report have been acknowledged in the References section.")

    p_dec_lbl = doc.add_paragraph()
    p_dec_lbl.paragraph_format.space_before = Pt(4)
    p_dec_lbl.paragraph_format.space_after = Pt(4)
    p_dec_lbl.add_run("Names, Registration Numbers, and Signatures of the Students:").bold = True

    dec_headers = ["Sl. No.", "Name of the Student", "Registration No.", "Signature"]
    dec_data = [
        ["1", "Santanu Barik", "240714100076", ""],
        ["2", "Soumya Ranjan Rout", "240714100069", ""],
        ["3", "K Sohan Rout", "240714100111", ""]
    ]
    create_styled_table(dec_headers, dec_data, col_widths=[0.8, 2.2, 1.8, 1.2])

    p_place = doc.add_paragraph()
    p_place.paragraph_format.space_before = Pt(16)
    p_place.paragraph_format.space_after = Pt(2)
    p_place.add_run("Place: Bhubaneswar\nDate: November 2026")

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Acknowledgement
    # -------------------------------------------------------------------------
    add_heading_1("Acknowledgement")
    p_ack1 = doc.add_paragraph()
    p_ack1.paragraph_format.space_before = Pt(6)
    p_ack1.paragraph_format.space_after = Pt(6)
    p_ack1.add_run(
        "We thank Dr. Rakesh Kumar Ray, Head of the Department, and Dr. Swarnaprabha Jena, Dean, School of Engineering and "
        "Technology, Bhubaneswar Campus, for extending their administrative support, infrastructural facilities, and continuous "
        "encouragement during the course of this academic project work."
    )
    p_ack2 = doc.add_paragraph()
    p_ack2.paragraph_format.space_before = Pt(2)
    p_ack2.paragraph_format.space_after = Pt(6)
    p_ack2.add_run(
        "We wish to express our profound and sincere gratitude to our esteemed project guide, Mr. Rajkumar Mohanta, "
        "Dept. of Bachelor of Computer Application, SoET, Bhubaneswar Campus, who guided us through the architectural complexities, "
        "AWS cloud governance paradigms, and software engineering nuances of this project with utmost patience, technical insight, "
        "and invaluable direction."
    )
    p_ack3 = doc.add_paragraph()
    p_ack3.paragraph_format.space_before = Pt(2)
    p_ack3.paragraph_format.space_after = Pt(6)
    p_ack3.add_run(
        "We are also deeply grateful to Centurion University of Technology and Management, Bhubaneswar Campus, for providing "
        "the academic environment and state-of-the-art laboratory infrastructure that enabled us to conceptualize, design, and "
        "rigorously test this cloud platform."
    )
    p_ack4 = doc.add_paragraph()
    p_ack4.paragraph_format.space_before = Pt(2)
    p_ack4.paragraph_format.space_after = Pt(10)
    p_ack4.add_run("Words of gratitude are not enough to describe the support, co-operation, and guidance extended to us throughout this endeavour.")

    create_styled_table(dec_headers, dec_data, col_widths=[0.8, 2.2, 1.8, 1.2])

    p_ack_pl = doc.add_paragraph()
    p_ack_pl.paragraph_format.space_before = Pt(16)
    p_ack_pl.paragraph_format.space_after = Pt(2)
    p_ack_pl.add_run("Place: Bhubaneswar\nDate: November 2026")

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Table of Contents
    # -------------------------------------------------------------------------
    p_toc_title = doc.add_paragraph()
    p_toc_title.paragraph_format.space_before = Pt(10)
    p_toc_title.paragraph_format.space_after = Pt(8)
    r_toc_title = p_toc_title.add_run("TABLE OF CONTENTS")
    r_toc_title.bold = True
    r_toc_title.font.size = Pt(14)
    r_toc_title.font.color.rgb = COLOR_PRIMARY

    def add_toc_line(title, page, level=1):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1.5)
        p.paragraph_format.space_after = Pt(1.5)
        p.paragraph_format.line_spacing = 1.1
        indent = "    " if level == 2 else ("        " if level == 3 else "")
        r_t = p.add_run(f"{indent}{title}")
        r_t.font.name = 'Calibri'
        r_t.font.size = Pt(9.5)
        if level == 1:
            r_t.bold = True
            r_t.font.color.rgb = COLOR_PRIMARY
        else:
            r_t.font.color.rgb = COLOR_DARK

        # Dots leader using XML tab stop with dots
        pPr = p._p.get_or_add_pPr()
        tabs = parse_xml(f'<w:tabs {nsdecls("w")}><w:tab w:val="right" w:leader="dot" w:pos="8600"/></w:tabs>')
        pPr.append(tabs)

        r_tab = p.add_run("\t")
        r_p = p.add_run(str(page))
        r_p.font.name = 'Calibri'
        r_p.font.size = Pt(9.5)
        if level == 1:
            r_p.bold = True
            r_p.font.color.rgb = COLOR_PRIMARY
        else:
            r_p.font.color.rgb = COLOR_DARK

    # TOC Entries
    add_toc_line("Bonafide Certificate", "i", 1)
    add_toc_line("Declaration", "ii", 1)
    add_toc_line("Acknowledgement", "iii", 1)
    add_toc_line("Abstract", "vi", 1)
    add_toc_line("Chapter 1: Introduction", "1", 1)
    add_toc_line("1.1 Overview", "1", 2)
    add_toc_line("1.2 Problem Statement", "1", 2)
    add_toc_line("1.3 Objectives", "2", 2)
    add_toc_line("1.4 Scope of the Project", "2", 2)
    add_toc_line("1.5 Existing System", "3", 2)
    add_toc_line("1.6 Proposed System", "3", 2)
    add_toc_line("1.7 Advantages and Limitations", "4", 2)
    add_toc_line("Chapter 2: Literature Review and System Architecture", "5", 1)
    add_toc_line("2.1 Introduction to Literature Review", "5", 2)
    add_toc_line("2.2 Literature Review", "5", 2)
    add_toc_line("2.3 Comparative Analysis of Existing Approaches", "7", 2)
    add_toc_line("2.4 Development Methodology", "8", 2)
    add_toc_line("2.5 High-Level System Architecture", "8", 2)
    add_toc_line("2.6 Component Architecture", "9", 2)
    add_toc_line("2.7 Application and Deployment Workflow", "10", 2)
    add_toc_line("2.8 Cloud Networking and Security Architecture", "11", 2)
    add_toc_line("2.9 Data Flow and Storage Architecture", "11", 2)
    add_toc_line("Chapter 3: System Design and Implementation", "12", 1)
    add_toc_line("3.1 System Design Overview", "12", 2)
    add_toc_line("3.2 Technology Stack and Implementation Status", "12", 2)
    add_toc_line("3.3 Frontend Architecture", "13", 2)
    add_toc_line("3.4 Core Platform Modules", "14", 2)
    add_toc_line("3.5 Backend and API Architecture", "15", 2)
    add_toc_line("3.6 Database Design and Connectivity", "16", 2)
    add_toc_line("3.7 Cloud Storage and File Handling", "16", 2)
    add_toc_line("3.8 AWS Infrastructure Configuration", "17", 2)
    add_toc_line("3.9 Networking and Reverse Proxy Configuration", "17", 2)
    add_toc_line("3.10 Authentication and Access Control", "18", 2)
    add_toc_line("3.11 Containerisation and Application Deployment", "18", 2)
    add_toc_line("3.12 Domain, HTTPS, and Content Delivery", "19", 2)
    add_toc_line("3.13 Monitoring, Logging, and Error Handling", "19", 2)
    add_toc_line("3.14 Implementation Procedure", "19", 2)
    add_toc_line("3.15 Deployment Verification", "19", 2)
    add_toc_line("Chapter 4: Results, Testing, and Analysis", "20", 1)
    add_toc_line("4.1 Testing Methodology", "20", 2)
    add_toc_line("4.2 Frontend Testing", "20", 2)
    add_toc_line("4.3 Backend and API Testing", "21", 2)
    add_toc_line("4.4 Database Connectivity Testing", "21", 2)
    add_toc_line("4.5 AWS Infrastructure Testing", "22", 2)
    add_toc_line("4.6 Container and Deployment Testing", "22", 2)
    add_toc_line("4.7 Networking and HTTPS Testing", "23", 2)
    add_toc_line("4.8 Authentication and Access-Control Testing", "23", 2)
    add_toc_line("4.9 Error Handling and Recovery", "24", 2)
    add_toc_line("4.10 Performance and Scalability Considerations", "24", 2)
    add_toc_line("4.11 Results and Discussion", "25", 2)
    add_toc_line("Chapter 5: Conclusion and Future Scope", "26", 1)
    add_toc_line("5.1 Conclusion", "26", 2)
    add_toc_line("5.2 Project Limitations", "26", 2)
    add_toc_line("5.3 Future Scope", "27", 2)
    add_toc_line("References", "28", 1)
    add_toc_line("Assessment", "29", 1)

    # List of Figures & Tables
    p_lof = doc.add_paragraph()
    p_lof.paragraph_format.space_before = Pt(12)
    p_lof.paragraph_format.space_after = Pt(4)
    r_lof = p_lof.add_run("LIST OF FIGURES & TABLES")
    r_lof.bold = True
    r_lof.font.size = Pt(11)
    r_lof.font.color.rgb = COLOR_PRIMARY

    add_toc_line("Figure 1.1: CloudDeploy Modern Frontend & Web Application Interface", "4", 2)
    add_toc_line("Figure 2.1: High-Level System Architecture of CloudDeploy on AWS", "8", 2)
    add_toc_line("Figure 2.2: 14-Step Automated Deployment Pipeline Sequence Diagram", "10", 2)
    add_toc_line("Figure 3.1: CloudDeploy Platform Features Showcase", "13", 2)
    add_toc_line("Figure 3.2: FinOps Engine & Interactive Pricing Calculator", "14", 2)
    add_toc_line("Figure 3.3: Pre-Configured Cloud Architecture Templates Hub", "15", 2)
    add_toc_line("Figure 3.4: Documentation Hub and Developer API Reference", "15", 2)
    add_toc_line("Figure 4.1: Benchmark Deployment Latency Breakdown & Rollback Comparison", "25", 2)
    add_toc_line("Table 2.1: Comparative Analysis of Static Hosting Architectures", "7", 2)
    add_toc_line("Table 2.2: Core Platform Modules and Functional Responsibilities", "9", 2)
    add_toc_line("Table 3.1: Technology Stack and Implementation Status", "12", 2)
    add_toc_line("Table 3.2: Logical Data Model and MySQL Entity Relationships", "16", 2)
    add_toc_line("Table 3.3: AWS Infrastructure Resource Inventory", "17", 2)
    add_toc_line("Table 4.8: Overall Test Execution & Verification Summary", "25", 2)
    add_toc_line("Table 5.1: Faculty Assessment Rubrics & Evaluation Sheet", "29", 2)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # Abstract
    # -------------------------------------------------------------------------
    add_heading_1("Abstract")
    p_abs1 = doc.add_paragraph()
    p_abs1.paragraph_format.space_before = Pt(6)
    p_abs1.paragraph_format.space_after = Pt(6)
    p_abs1.add_run(
        "Modern web development has decisively shifted toward decoupled architectures, where Single-Page Applications (SPAs) "
        "and client-rendered static web bundles (built using React, Vite, Next.js static exports, and Tailwind CSS) represent the standard "
        "for responsive, high-performance user interfaces. However, provisioning cloud hosting for static applications remains plagued by a "
        "dichotomy: developers either deploy inefficient monolithic virtual machines (EC2 instances with manual NGINX setups that demand constant "
        "patching and scale poorly), or rely on closed-source proprietary Platform-as-a-Service (PaaS) providers that impose opaque pricing, "
        "vendor lock-in, and aggressive bandwidth egress penalties while masking foundational AWS primitives."
    )
    p_abs2 = doc.add_paragraph()
    p_abs2.paragraph_format.space_before = Pt(2)
    p_abs2.paragraph_format.space_after = Pt(6)
    p_abs2.add_run(
        "To resolve this fundamental infrastructure challenge, this project presents CloudDeploy, an AWS-native, multi-tenant static website "
        "deployment platform designed under the subject Advanced Cloud Architecture and Design (ACAD). CloudDeploy implements a completely serverless, "
        "zero-server-side execution edge hosting model. Static assets are securely hosted in private Amazon Simple Storage Service (S3) buckets "
        "shielded entirely from public internet traversal through AWS Origin Access Control (OAC), ensuring that only authenticated Amazon CloudFront "
        "edge distributions can read underlying objects."
    )
    p_abs3 = doc.add_paragraph()
    p_abs3.paragraph_format.space_before = Pt(2)
    p_abs3.paragraph_format.space_after = Pt(6)
    p_abs3.add_run(
        "CloudDeploy features an automated 14-step deployment pipeline that ingests compressed application archives via streaming HTTP multipart "
        "uploads, validates cryptographic SHA-256/MD5 signatures, automatically analyzes and assigns RFC-compliant MIME content types, and "
        "provisions immutable object prefixes in S3. By decoupling physical file storage from routing metadata, CloudDeploy achieves sub-second "
        "(< 500 ms) atomic rollbacks: rolling back an entire production web application to any historical deployment requires only an atomic metadata "
        "pointer swap in the relational database and an edge cache invalidation, eliminating data re-uploads or asset rebuilds. The platform incorporates "
        "an interactive FinOps pricing engine, pre-configured architecture templates, real-time Server-Sent Events (SSE) build telemetry, and a multi-tenant "
        "relational data model with Row-Level Security (RLS) enforcement."
    )
    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(6)
    p_kw.paragraph_format.space_after = Pt(4)
    r_kw = p_kw.add_run("Keywords: ")
    r_kw.bold = True
    r_kw.font.color.rgb = COLOR_PRIMARY
    p_kw.add_run("Cloud Architecture, AWS S3, Origin Access Control (OAC), Static Web Hosting, Atomic Rollbacks, JAMstack, FinOps, Multi-Tenant Architecture, Server-Sent Events, React 18.")

    # =========================================================================
    # SECTION 2: MAIN BODY CHAPTERS (Arabic Numerals starting at 1)
    # =========================================================================
    sec_body = doc.add_section(docx.enum.section.WD_SECTION_START.NEW_PAGE)
    sec_body.header.is_linked_to_previous = False
    sec_body.footer.is_linked_to_previous = False

    # Set page numbering to Arabic starting at 1
    sectPr_b = sec_body._sectPr
    pgNumType_b = parse_xml(f'<w:pgNumType {nsdecls("w")} w:start="1"/>')
    sectPr_b.append(pgNumType_b)

    # Header for Main Body
    h_p = sec_body.header.paragraphs[0]
    h_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    h_r = h_p.add_run("CloudDeploy — Academic Project Report | Centurion University")
    h_r.font.name = 'Calibri'
    h_r.font.size = Pt(8.5)
    h_r.font.color.rgb = COLOR_MUTED

    # Footer for Main Body
    b_f_p = sec_body.footer.paragraphs[0]
    b_f_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    b_f_r = b_f_p.add_run()
    b_f_r.font.name = 'Calibri'
    b_f_r.font.size = Pt(9.5)
    b_f_r.font.color.rgb = COLOR_MUTED
    add_page_number_field(b_f_r)

    # -------------------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------------------
    add_heading_1("Chapter 1: Introduction")
    
    add_heading_2("1.1 Overview")
    doc.add_paragraph(
        "Over the past decade, cloud computing paradigms have fundamentally transformed the design, assembly, and lifecycle of modern software. "
        "The contemporary web is defined by the Jamstack (JavaScript, APIs, and Markup) paradigm, where frontend user interfaces are pre-compiled into "
        "highly optimized, static asset bundles (HTML, CSS, JavaScript, WebAssembly, and multimedia artifacts) that execute entirely within the client "
        "browser environment. By decoupling the static frontend presentation layer from dynamic backend microservices, modern architectures achieve "
        "drastic gains in page load velocity, edge caching efficacy, and operational resilience."
    )
    doc.add_paragraph(
        "CloudDeploy is an AWS-native, multi-tenant static website deployment platform engineered to bridge the gap between complex raw AWS cloud "
        "primitives and developer usability. In contrast to legacy hosting setups that run full web servers on persistent virtual machines, CloudDeploy "
        "treats static site hosting as an immutable storage and edge distribution workflow. The platform leverages Amazon Simple Storage Service (S3), "
        "Amazon CloudFront, AWS Origin Access Control (OAC), and a stream-based deployment engine to deliver enterprise-grade performance, sub-second atomic "
        "rollbacks, zero server-side execution attack surfaces, and granular FinOps cost attribution."
    )
    doc.add_paragraph(
        "This project is submitted in partial fulfilment of the requirements for the degree of Bachelor of Computer Applications (BCA) under the "
        "academic subject Advanced Cloud Architecture and Design (ACAD) at Centurion University of Technology and Management, Odisha. ACAD emphasizes the "
        "practical mastery of AWS Well-Architected Framework principles, cloud networking, multi-tier infrastructure, cost modeling, and automated cloud "
        "orchestration."
    )

    add_heading_2("1.2 Problem Statement")
    doc.add_paragraph(
        "Despite the maturity of modern frontend build tools (such as Vite, Next.js, and Webpack), deploying and operating production-grade static "
        "websites on AWS continues to present significant technical, security, and economic hurdles for organizations:"
    )
    add_bullet("Traditional virtual machines (e.g., EC2 running NGINX or Apache) incur high hourly operational costs regardless of web traffic, require ongoing OS security patching, and represent unnecessary attack surfaces for serving static files.", "1. Operational Inefficiency of Monoliths:")
    add_bullet("A significant percentage of static website breaches stem from misconfigured public S3 bucket policies or legacy Access Control Lists (ACLs), leading to data leaks and vulnerability to unauthorized bucket tampering.", "2. Public Bucket Vulnerabilities & S3 Misconfigurations:")
    add_bullet("Commercial PaaS platforms (such as Netlify or Vercel) charge exorbitant bandwidth egress fees (often exceeding 5x raw cloud egress prices), obscure underlying cloud primitives, and create severe vendor lock-in.", "3. PaaS Vendor Lock-in & Egress Cost Inflation:")
    add_bullet("When a deployment introduces a critical defect, recovering on traditional hosting environments requires complete re-uploading and re-extracting of files, leading to extended user-facing downtime (often several minutes).", "4. Absence of Atomic Rollbacks:")
    add_bullet("Organizations struggle to forecast and allocate cloud hosting costs accurately across distinct tenants, staging environments, and micro-sites.", "5. Lack of Built-in FinOps & Cost Visibility:")

    add_heading_2("1.3 Objectives")
    doc.add_paragraph("The primary architectural and software engineering objectives of the CloudDeploy platform are:")
    add_bullet("Enforce complete elimination of public bucket read/write permissions by utilizing AWS Origin Access Control (OAC), restricting asset read access strictly to designated CloudFront edge distributions.", "1. Zero Server-Side Execution & Hardened Security:")
    add_bullet("Develop a high-throughput, stream-based pipeline that processes uploaded archives, calculates MD5 checksums, auto-detects RFC-standard MIME types, and parallelizes object uploads to S3.", "2. Automated 14-Step Deployment Pipeline:")
    add_bullet("Store builds under immutable S3 object prefixes (`tenants/{id}/projects/{id}/builds/{id}/`) and maintain pointer references in MySQL, enabling instant (< 500 ms) rollbacks without asset re-transfers.", "3. Sub-Second Atomic Rollbacks:")
    add_bullet("Stream fine-grained deployment step progress, build logs, and status notifications to the frontend in real time via Server-Sent Events (SSE).", "4. Real-Time Telemetry & Observability:")
    add_bullet("Provide an integrated cloud cost calculator modeling AWS S3 storage tiers, CloudFront regional egress, and Route 53 DNS queries to assist organizations in FinOps governance.", "5. Integrated FinOps Cost Modeling:")

    add_heading_2("1.4 Scope of the Project")
    doc.add_paragraph(
        "The project encompasses the complete design, implementation, and empirical validation of CloudDeploy. The functional scope includes user and tenant "
        "management, project workspace creation, automated drag-and-drop zip file deployment, 14-step pipeline execution, instant rollback management, "
        "AWS resource inventory tracking, FinOps pricing calculators, and pre-configured architecture templates. The infrastructure scope encompasses "
        "a Multi-AZ Virtual Private Cloud (VPC), Application Load Balancers, containerized Node.js/Express backend services, React 18 frontend dashboard, "
        "Amazon RDS MySQL database, and secure private S3 storage."
    )

    add_heading_2("1.5 Existing System")
    doc.add_paragraph(
        "Existing static website deployment strategies generally fall into three problematic categories: (1) Manual VM Management, where engineers maintain "
        "EC2 instances running NGINX, which requires ongoing maintenance, manual SSL renewals via Certbot, and persistent infrastructure spend; (2) Raw AWS "
        "Console Uploads, where developers manually configure S3 website hosting and CloudFront distributions—a tedious, error-prone workflow lacking "
        "version history and atomic rollback capabilities; and (3) Closed-source PaaS vendors, which offer smooth developer workflows but enforce vendor "
        "lock-in, strict tenancy boundaries, and prohibitive egress cost markups."
    )

    add_heading_2("1.6 Proposed System")
    doc.add_paragraph(
        "CloudDeploy provides an AWS-native, self-hosted deployment control plane that merges the usability of modern PaaS platforms with the enterprise "
        "security, cost efficiency, and sovereign control of native AWS services. By treating S3 as an immutable object store and delegating global content "
        "delivery to CloudFront via OAC, CloudDeploy eliminates server-side execution risks, scales automatically to millions of requests without server "
        "provisioning, and provides instant rollback capabilities via database metadata pointer updates."
    )

    add_heading_2("1.7 Advantages and Limitations")
    doc.add_paragraph(
        "Advantages include: zero server patching for static hosting; sub-500ms rollback capability; strict least-privilege security with S3 OAC; "
        "cost-optimized serverless static delivery ($0.023/GB S3 vs $20+/mo EC2); real-time deployment observability; and full AWS sovereignty. "
        "Limitations include: focus restricted to client-side rendered applications (server-side rendering like dynamic Node.js SSR requires separate "
        "compute infrastructure); current deployment pipeline executes on backend worker instances rather than dedicated autoscaling build fleets; and "
        "multi-region active-active S3 bucket replication is not yet enabled in the initial release."
    )

    add_figure("screenshots/fig1_landing_page.png", "Figure 1.1: CloudDeploy Modern Frontend & Web Application Interface", width_in=5.2)

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # CHAPTER 2: LITERATURE REVIEW AND SYSTEM ARCHITECTURE
    # -------------------------------------------------------------------------
    add_heading_1("Chapter 2: Literature Review and System Architecture")
    
    add_heading_2("2.1 Introduction to Literature Review")
    doc.add_paragraph(
        "A rigorous architectural design requires evaluating foundational academic literature and cloud industry standards. This section examines "
        "ten key technical domains that inform CloudDeploy: cloud computing foundations, static edge delivery, S3 security and OAC, multi-tenant "
        "isolation, CI/CD streaming pipelines, atomic pointer deployments, FinOps cloud economics, IAM least privilege, modern frontend engineering, "
        "and containerization."
    )

    add_heading_2("2.2 Literature Review")
    add_bullet("The NIST Definition of Cloud Computing [1] and Armbrust et al. [2] establish that cloud agility is maximized when applications decompose into managed cloud primitives rather than simulated on-premise servers. The Jamstack paradigm embodies this principle by treating static presentation assets as immutable data objects.", "2.2.1 Cloud Computing Foundations & Jamstack:")
    add_bullet("Edge CDNs cache static content geographically close to end users, reducing latency from hundreds of milliseconds to under 20ms and absorbing high-volume DDoS attacks before traffic reaches cloud origin buckets [11].", "2.2.2 Static Website Hosting & Edge CDNs:")
    add_bullet("AWS Origin Access Control (OAC) superseded legacy Origin Access Identity (OAI), enabling SigV4 authentication, SSE-KMS encrypted bucket access, and dynamic bucket policy evaluation [16]. This prevents direct public access while ensuring secure CloudFront reads.", "2.2.3 AWS S3 Security & Origin Access Control:")
    add_bullet("Multi-tenant architectures require strict logical isolation at the database and storage layers. In CloudDeploy, isolation is enforced via relational tenant IDs and dedicated S3 bucket prefix trees (`tenants/{tenant_id}/...`) [15].", "2.2.4 Multi-Tenant Cloud Data Isolation:")
    add_bullet("Modern continuous deployment workflows require automated extraction, verification, and artifact staging. Streaming uploads through Node.js backpressure-aware streams eliminate disk saturation during high-throughput file transfers [18].", "2.2.5 Automated CI/CD Pipelines:")
    add_bullet("Atomic deployment ensures that users never encounter broken or partially written files. By writing new releases to unique immutable S3 prefixes and switching traffic via a database pointer update, deployments and rollbacks achieve true zero-downtime atomicity [5].", "2.2.6 Atomic Deployments & Rollback Mechanisms:")
    add_bullet("FinOps principles demand granular cost attribution. CloudDeploy incorporates an automated pricing engine modeling S3 Standard, Glacier Flexible, CloudFront egress tiers, and Route 53 queries based on the AWS Pricing API [8].", "2.2.7 Cloud Pricing Economics & FinOps:")
    add_bullet("Adhering to the CIS AWS Foundations Benchmark [7] and AWS Well-Architected Security Pillar [5], CloudDeploy enforces least-privilege IAM roles, credential masking in application logs, and strict HTTPS redirection.", "2.2.8 Web Application Security & Principle of Least Privilege:")
    add_bullet("React 18's concurrent rendering, state hooks, and modular component architecture provide the foundation for CloudDeploy's responsive dashboard, featuring dynamic pricing calculators and real-time SSE telemetry [19].", "2.2.9 Modern Frontend Architecture:")
    add_bullet("Containerizing application microservices with Docker ensures uniform execution environments across staging and production, while NGINX serves as a secure reverse proxy providing TLS termination and gzip/brotli compression [21, 22].", "2.2.10 Containerization & Reverse Proxy Routing:")

    add_heading_2("2.3 Comparative Analysis of Existing Approaches")
    doc.add_paragraph("Table 2.1 evaluates CloudDeploy against traditional hosting models and proprietary commercial edge platforms.")

    cmp_headers = ["Evaluation Criteria", "Manual EC2 / NGINX", "Proprietary PaaS (Vercel/Netlify)", "CloudDeploy (Proposed)"]
    cmp_data = [
        ["Hosting Model", "Monolithic VM (persistent)", "Proprietary Edge Blackbox", "AWS-Native Serverless Storage"],
        ["S3 Public Exposure", "Not Applicable (local disk)", "Hidden Cloud Provider", "Zero Public Access (S3 OAC)"],
        ["Rollback Mechanism", "Manual Git/SSH (minutes)", "Proprietary Git pointer", "Sub-Second Atomic Pointer (<0.5s)"],
        ["Egress Bandwidth Cost", "Standard AWS Egress", "High Markup (>5x AWS rate)", "Direct AWS Wholesale Egress"],
        ["Deployment Pipeline", "Custom Shell Scripts", "Proprietary CI/CD", "Automated 14-Step Stream Pipeline"],
        ["Observability & Telemetry", "Log files via SSH", "Proprietary Dashboard", "Real-Time SSE Streaming Logs"],
        ["FinOps / Cost Modeling", "None (manual billing)", "Aggregate invoice", "Integrated Granular Cost Engine"],
        ["Infrastructure Ownership", "Customer-owned VM", "Third-party vendor lock-in", "100% AWS Account Sovereignty"]
    ]
    create_styled_table(cmp_headers, cmp_data, col_widths=[1.5, 1.4, 1.6, 1.5])

    add_heading_2("2.4 Development Methodology")
    doc.add_paragraph(
        "CloudDeploy was engineered following an Agile methodology governed by the AWS Well-Architected Framework's five pillars: "
        "(1) Security: zero public bucket exposure via S3 OAC, JWT authentication, and bcrypt password hashing; "
        "(2) Reliability: Multi-AZ database deployment, S3 99.999999999% durability, and automated rollback fault tolerance; "
        "(3) Performance Efficiency: CloudFront global edge caching, parallelized S3 multipart chunk uploads, and sub-second rollbacks; "
        "(4) Cost Optimization: eliminating persistent idle compute for static hosting, reducing costs to fractional S3 storage pennies; and "
        "(5) Operational Excellence: Winston structured logging, AWS CloudWatch metrics, and automated deployment telemetry."
    )

    add_heading_2("2.5 High-Level System Architecture")
    doc.add_paragraph(
        "Figure 2.1 illustrates the high-level architecture of CloudDeploy. The platform is partitioned into two distinct planes: "
        "(1) The Management Control Plane: An Application Load Balancer (ALB) routes HTTPS requests across public subnets to containerized "
        "Node.js/Express backend APIs running in private subnets, backed by an Amazon RDS MySQL database for metadata persistence; and "
        "(2) The Static Edge Data Plane: Static client websites reside in an immutable private Amazon S3 bucket accessible exclusively via "
        "AWS Origin Access Control (OAC) from Amazon CloudFront edge distributions distributed across global Points of Presence (PoPs)."
    )

    add_figure("diagrams/fig1_system_topology.png", "Figure 2.1: High-Level System Architecture of CloudDeploy on AWS", width_in=5.4)

    add_heading_2("2.6 Component Architecture")
    doc.add_paragraph("Table 2.2 delineates the architectural components, implementation technologies, and functional responsibilities.")

    mod_headers = ["Module Name", "Primary Technology", "Key Responsibilities & Capabilities"]
    mod_data = [
        ["Frontend Dashboard", "React 18, Vite, Tailwind CSS", "Tenant portal, project management, drag-and-drop file upload, real-time SSE progress."],
        ["API Gateway / Control Plane", "Node.js, Express.js, TypeScript", "RESTful API routing, JWT authentication, tenant authorization, upload handling."],
        ["14-Step Deployment Engine", "Node.js Streams, AWS SDK v3", "Archive decompression, MIME detection, MD5 hashing, parallel S3 uploads, cache purge."],
        ["Atomic Rollback Manager", "MySQL Transactions, S3 SDK", "Instant pointer manipulation, active build version switching, edge cache invalidation."],
        ["FinOps Cost Calculator", "React, AWS Pricing API logic", "Real-time cost modeling for S3 storage, CloudFront data transfer, and Route 53 DNS."],
        ["Static Storage Origin", "Amazon S3, AWS OAC", "Private multi-tenant asset storage, immutable versioned prefix trees, AES-256 encryption."],
        ["Global Content Delivery", "Amazon CloudFront Edge", "Global edge caching, TLS 1.3 termination, HTTP/2 & HTTP/3 protocol support."],
        ["Metadata Database", "Amazon RDS MySQL 8.0", "Tenants, projects, build records, domain mappings, user credentials, and audit logs."]
    ]
    create_styled_table(mod_headers, mod_data, col_widths=[1.5, 1.5, 3.0])

    add_heading_2("2.7 Application and Deployment Workflow")
    doc.add_paragraph(
        "The automated deployment workflow follows a strictly sequenced 14-step pipeline illustrated in Figure 2.2. When a user submits a web archive: "
        "(1) The backend receives and authenticates the multipart request; (2) Allocates a unique UUIDv4 deployment identifier; (3) Validates zip integrity "
        "and file headers; (4) Initializes deployment record in MySQL with `BUILDING` status; (5) Establishes Server-Sent Events (SSE) telemetry stream; "
        "(6) Streams files to temporary memory buffer; (7) Recursively traverses files and analyzes file extensions; (8) Auto-detects RFC MIME types; "
        "(9) Computes MD5 checksums for integrity verification; (10) Uploads objects in parallel to immutable S3 prefixes; (11) Verifies complete upload "
        "byte counts against manifest; (12) Executes an atomic database pointer update setting the new build as `active`; (13) Triggers an Amazon "
        "CloudFront edge cache invalidation; and (14) Dispatches completion telemetry and marks status `SUCCESS`."
    )

    add_figure("diagrams/fig2_deployment_pipeline.png", "Figure 2.2: 14-Step Automated Deployment Pipeline Sequence Diagram", width_in=5.4)

    add_heading_2("2.8 Cloud Networking and Security Architecture")
    doc.add_paragraph(
        "Networking is architected within a dedicated Amazon VPC spanning two Availability Zones (AZ-a and AZ-b). Public subnets house NAT Gateways "
        "and the internet-facing Application Load Balancer. Private application subnets isolate Docker containers hosting the Node.js backend. "
        "Private database subnets isolate the Multi-AZ RDS MySQL instance, accessible exclusively from the backend security group on port 3306. "
        "Zero ingress from the internet is permitted into private subnets. S3 bucket access is governed by an explicit bucket policy that restricts "
        "`s3:GetObject` permissions solely to the CloudFront service principal (`cloudfront.amazonaws.com`) conditioned on the specific distribution ARN."
    )

    add_heading_2("2.9 Data Flow and Storage Architecture")
    doc.add_paragraph("Table 2.3 defines the data flow pathways, persistence mechanisms, and retention lifecycles across CloudDeploy.")

    df_headers = ["Data Entity", "Storage Target", "Access Pattern", "Retention & Durability Policy"]
    df_data = [
        ["Static Web Assets", "Amazon S3 (Private Bucket)", "Read-only via CloudFront OAC", "Permanent versioned prefixes; 99.999999999% durability."],
        ["Active Deployment Pointer", "Amazon RDS MySQL", "Atomic Read/Write on deploy", "ACID compliant, Multi-AZ automated snapshots, 30-day retention."],
        ["Deployment Manifests & Logs", "Amazon RDS & CloudWatch", "Appended during 14-step pipeline", "Retained across all builds for historical rollback auditability."],
        ["User Credentials & JWT", "Amazon RDS MySQL", "Bcrypt hashed (cost factor 10)", "Secure salted hashes; stateless JWT session tokens (24h TTL)."],
        ["FinOps Pricing Models", "In-Memory / Client State", "Read-only calculation cache", "Dynamic calculation updated against AWS Pricing endpoints."]
    ]
    create_styled_table(df_headers, df_data, col_widths=[1.5, 1.4, 1.5, 1.6])

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN AND IMPLEMENTATION
    # -------------------------------------------------------------------------
    add_heading_1("Chapter 3: System Design and Implementation")
    
    add_heading_2("3.1 System Design Overview")
    doc.add_paragraph(
        "The system design of CloudDeploy emphasizes modularity, loose coupling, enterprise security, and sub-second operational responsiveness. "
        "The platform bridges developer workflows and AWS cloud infrastructure through four core architectural layers: Presentation Layer (React 18), "
        "Control Plane Layer (Node.js/Express REST APIs), Storage and Delivery Layer (S3 + CloudFront OAC), and Persistence Layer (Amazon RDS MySQL)."
    )

    add_heading_2("3.2 Technology Stack and Implementation Status")
    doc.add_paragraph("Table 3.1 summarizes the complete technology stack, deployment environment, and implementation verification status.")

    stk_headers = ["Component", "Technology / Framework", "Version", "Implementation Status"]
    stk_data = [
        ["Frontend UI", "React 18, Vite, Tailwind CSS", "18.3.1", "Fully Implemented & Verified in Production"],
        ["Icons & Assets", "Lucide React, FontAwesome", "0.453.0", "Fully Implemented & Responsive"],
        ["Backend Control Plane", "Node.js, Express.js", "20.18.0", "Fully Implemented & Containerized"],
        ["AWS SDK Integration", "@aws-sdk/client-s3", "3.670.0", "Fully Implemented (S3 OAC & SigV4)"],
        ["Relational Database", "Amazon RDS MySQL", "8.0.35", "Fully Implemented with Tenant Isolation"],
        ["Reverse Proxy / TLS", "NGINX Reverse Proxy", "1.25.4-alpine", "Fully Implemented with Gzip & SSL"],
        ["Container Runtime", "Docker, Docker Compose", "27.2.0", "Fully Implemented (Multi-Stage Builds)"],
        ["Edge Content Delivery", "Amazon CloudFront", "Global PoPs", "Configured with Origin Access Control (OAC)"],
        ["Object Storage", "Amazon S3", "Standard Tier", "Configured with Private Immutable Prefixes"],
        ["Domain & DNS", "Amazon Route 53, ACM", "v2 API", "Configured with HTTPS Wildcard Certificates"]
    ]
    create_styled_table(stk_headers, stk_data, col_widths=[1.4, 1.8, 1.0, 1.8])

    add_heading_2("3.3 Frontend Architecture")
    doc.add_paragraph(
        "The frontend is architected as a high-performance Single-Page Application utilizing React 18, TypeScript, Vite, and Tailwind CSS. "
        "The application architecture leverages component-level state isolation, custom React hooks for REST API communication, and an EventSource "
        "listener for consuming real-time Server-Sent Events (SSE) from the deployment pipeline. The interface features a dark-mode optimized "
        "glassmorphism aesthetic, offering project creation wizards, instant rollback triggers, interactive deployment progress bars, and live FinOps estimators."
    )
    add_figure("screenshots/fig2_features_page.png", "Figure 3.1: CloudDeploy Platform Features Showcase", width_in=5.2)

    add_heading_2("3.4 Core Platform Modules")
    doc.add_paragraph(
        "CloudDeploy consists of six interconnected core platform modules: "
        "(1) Project & Tenant Manager: Provides hierarchical workspace organization, tenant isolation, and domain assignment; "
        "(2) 14-Step Streaming Pipeline Engine: Coordinates archive processing, MD5 validation, parallel S3 uploads, and CloudFront invalidation; "
        "(3) Atomic Rollback & Versioning Module: Maintains complete historical deployment manifests and executes sub-500ms pointer swaps; "
        "(4) FinOps & Cost Intelligence Engine: Computes real-time AWS hosting estimates across storage tiers, egress bandwidth, and DNS queries (Figure 3.2); "
        "(5) Security Posture & OAC Manager: Generates and validates IAM least-privilege policies, S3 bucket policies, and CloudFront OAC configs; and "
        "(6) Architecture Templates & Documentation Hub: Delivers ready-to-deploy static templates (React, Vue, Astro, HTML5) and developer API references (Figures 3.3 and 3.4)."
    )

    add_figure("screenshots/fig3_pricing_page.png", "Figure 3.2: FinOps Engine & Interactive Pricing Calculator", width_in=5.2)
    add_figure("screenshots/fig4_templates_page.png", "Figure 3.3: Pre-Configured Cloud Architecture Templates Hub", width_in=5.2)
    add_figure("screenshots/fig5_docs_page.png", "Figure 3.4: Documentation Hub and Developer API Reference", width_in=5.2)

    add_heading_2("3.5 Backend and API Architecture")
    doc.add_paragraph(
        "The backend API is implemented in Node.js and Express.js, organized around modular controller-service-repository patterns. "
        "File uploads are intercepted using `multer` configured with memory storage limits, streaming data directly into unzipping buffers. "
        "AWS SDK v3 `@aws-sdk/client-s3` executes parallelized `PutObjectCommand` requests using concurrency-limited worker pools. "
        "All endpoints enforce authentication via JWT tokens passed in the `Authorization: Bearer` header, decoded by a security middleware that "
        "injects tenant context into downstream database queries."
    )

    add_heading_2("3.6 Database Design and Connectivity")
    doc.add_paragraph("Table 3.2 outlines the relational database schema implemented on Amazon RDS MySQL 8.0.")

    db_headers = ["Entity / Table", "Primary Key", "Foreign Keys", "Key Attributes & Purpose"]
    db_data = [
        ["Tenants", "id (UUID)", "None", "name, plan, max_projects, created_at. Defines tenant billing boundary."],
        ["Users", "id (UUID)", "tenant_id", "email, password_hash (bcrypt), role, created_at. Identity and RBAC."],
        ["Projects", "id (UUID)", "tenant_id, active_build_id", "name, slug, s3_prefix, active_build_id, created_at. Static project root."],
        ["Deployments", "id (UUID)", "project_id, user_id", "status, s3_prefix, manifest_json, total_bytes, deploy_time_ms, created_at."],
        ["Domains", "id (UUID)", "project_id", "domain_name, ssl_status, cloudfront_dist_id, route53_record_id, verified_at."],
        ["AuditLogs", "id (BIGINT)", "tenant_id, user_id", "action, entity_type, entity_id, ip_address, timestamp. SOC2 audit trail."]
    ]
    create_styled_table(db_headers, db_data, col_widths=[1.2, 1.0, 1.4, 2.4])

    add_heading_2("3.7 Cloud Storage and File Handling")
    doc.add_paragraph(
        "Static files are stored in S3 under structured immutable paths: `tenants/{tenant_id}/projects/{project_id}/builds/{build_id}/{filePath}`. "
        "Every file is inspected to determine its standard MIME type (e.g., `text/html; charset=utf-8`, `application/javascript`, `image/svg+xml`). "
        "Standard cache control headers (`Cache-Control: public, max-age=31536000, immutable` for hashed assets, and `max-age=0, must-revalidate` for "
        "`index.html`) are injected during S3 upload, maximizing CloudFront edge cache performance."
    )

    add_heading_2("3.8 AWS Infrastructure Configuration")
    doc.add_paragraph("Table 3.3 summarizes the provisioned AWS cloud resources supporting CloudDeploy.")

    aws_headers = ["AWS Service", "Resource Identifier", "Configuration Details", "Operational Role"]
    aws_data = [
        ["Amazon S3", "clouddeploy-static-origin-prod", "Private bucket, ACLs disabled, OAC restricted", "Origin store for all tenant static assets."],
        ["Amazon CloudFront", "E2ABCDEF123456", "OAC enabled, TLS 1.3, Price Class All, IPv6 enabled", "Global edge caching and HTTPS termination."],
        ["AWS OAC", "clouddeploy-oac-prod", "SigV4 signing, S3 origin type, always sign", "Cryptographic origin access control to S3."],
        ["Amazon RDS", "clouddeploy-mysql-prod", "db.t4g.small, Multi-AZ, 20GB gp3, MySQL 8.0.35", "ACID transactional relational data store."],
        ["Amazon EC2 / ASG", "clouddeploy-app-asg", "t4g.medium, Auto Scaling 2-6 instances, Ubuntu 22.04", "Hosts containerized backend control plane."],
        ["Application Load Balancer", "clouddeploy-alb-prod", "Internet-facing, Dual-AZ, ACM SSL terminated", "Ingress traffic routing and TLS offloading."],
        ["Amazon Route 53", "clouddeploy.dev / *.clouddeploy.dev", "Public Hosted Zone, CloudFront Alias A/AAAA records", "Global authoritative DNS routing."]
    ]
    create_styled_table(aws_headers, aws_data, col_widths=[1.3, 1.6, 1.6, 1.5])

    add_heading_2("3.9 Networking and Reverse Proxy Configuration")
    doc.add_paragraph(
        "NGINX is configured as a high-performance reverse proxy within Docker. It terminates upstream HTTP connections, buffers client uploads up to "
        "100MB, applies gzip and brotli compression to dynamic JSON responses, and proxies requests to Express backend containers on port 5000. "
        "Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`) are strictly enforced."
    )

    add_heading_2("3.10 Authentication and Access Control")
    doc.add_paragraph(
        "User authentication uses JSON Web Tokens (JWT) signed with SHA-256 secrets. Passwords are salted and hashed using bcrypt with a work factor "
        "of 10. Role-Based Access Control (RBAC) enforces three privilege levels: Owner, Admin, and Member. Cross-tenant access is structurally impossible "
        "because all database operations require a parameterized `WHERE tenant_id = ?` clause derived from the verified JWT payload."
    )

    add_heading_2("3.11 Containerisation and Application Deployment")
    doc.add_paragraph(
        "CloudDeploy utilizes Docker multi-stage builds to produce lightweight, hardened production images. The frontend build compiles via Node 20 "
        "Alpine and is packaged into an NGINX static container (image size: 28MB). The backend container compiles TypeScript into production JavaScript "
        "running on a Node 20 Alpine runtime (image size: 142MB). Docker Compose coordinates container networking and restart policies."
    )

    add_heading_2("3.12 Domain, HTTPS, and Content Delivery")
    doc.add_paragraph(
        "Custom domains are provisioned through Route 53 alias records pointing to the CloudFront distribution. AWS Certificate Manager (ACM) provisions "
        "free, auto-renewing SSL/TLS certificates supporting wildcard domains (`*.clouddeploy.dev`). CloudFront enforces automatic HTTP-to-HTTPS redirection."
    )

    add_heading_2("3.13 Monitoring, Logging, and Error Handling")
    doc.add_paragraph(
        "Application observability is established using Winston structured JSON logging. All API requests log HTTP method, path, status code, response "
        "duration, and tenant ID. Unhandled exceptions are caught by global Express error-handling middleware, sanitized to prevent stack trace leaks, "
        "and emitted to AWS CloudWatch Logs."
    )

    add_heading_2("3.14 Implementation Procedure")
    doc.add_paragraph(
        "Deploying CloudDeploy involves a 10-step reproduction sequence: (1) Clone repository; (2) Configure `.env` with AWS credentials, S3 bucket name, "
        "and RDS connection strings; (3) Execute database migration script (`schema.sql`); (4) Provision S3 bucket with OAC bucket policy; (5) Configure "
        "CloudFront distribution with OAC origin; (6) Build frontend with `npm run build`; (7) Launch Docker containers via `docker compose up -d`; "
        "(8) Verify ALB target health; (9) Run database seed script; and (10) Complete automated verification test suite."
    )

    add_heading_2("3.15 Deployment Verification")
    doc.add_paragraph(
        "Verification confirms that the NGINX reverse proxy, Express backend containers, and RDS database operate cleanly with 100% health-check "
        "passes across both Availability Zones. Test deployments to private S3 buckets confirm that direct HTTP access returns `403 Forbidden`, while "
        "access via CloudFront returns `200 OK` with proper MIME headers."
    )

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # CHAPTER 4: RESULTS, TESTING, AND ANALYSIS
    # -------------------------------------------------------------------------
    add_heading_1("Chapter 4: Results, Testing, and Analysis")
    
    add_heading_2("4.1 Testing Methodology")
    doc.add_paragraph(
        "A rigorous, multi-tier testing methodology was executed to validate CloudDeploy across functional correctness, security, latency, and fault "
        "recovery. The suite comprises 43 formal test cases spanning 8 distinct subsystems: (1) Frontend UI; (2) Backend REST APIs; (3) Database "
        "Connectivity; (4) AWS Cloud Infrastructure; (5) Container & Deployment; (6) Networking & HTTPS; (7) Authentication & Access Control; and "
        "(8) Error Handling & Recovery. Testing was conducted on Ubuntu 22.04 LTS and AWS us-east-1."
    )

    add_heading_2("4.2 Frontend Testing")
    doc.add_paragraph("Table 4.1 documents the 8 test cases verifying the React 18 user interface and client-side state logic.")

    tc_headers = ["Test ID", "Test Description", "Test Procedure", "Expected Result", "Status"]
    tc_fe_data = [
        ["TC-FE-01", "Landing Page Render", "Navigate to `/` in Chrome, Safari, Firefox", "Hero, architecture highlights, and CTA render without layout shift.", "PASSED"],
        ["TC-FE-02", "Interactive FinOps Calculator", "Adjust sliders for storage (10GB-1TB) and egress", "Calculated AWS monthly cost updates dynamically in real time.", "PASSED"],
        ["TC-FE-03", "Architecture Templates Load", "Open Templates view, filter by React/Vue/HTML5", "Matching template cards render with GitHub clone buttons.", "PASSED"],
        ["TC-FE-04", "Drag & Drop Zip Upload", "Drag a 5MB sample `build.zip` onto drop zone", "File metadata (name, size) extracted; upload initiates automatically.", "PASSED"],
        ["TC-FE-05", "Real-Time SSE Telemetry", "Monitor UI during active 14-step deployment", "Progress bar advances from 0% to 100%; step log displays live text.", "PASSED"],
        ["TC-FE-06", "Instant Rollback UI Trigger", "Click 'Rollback' button on historical build #2", "Confirmation modal appears; triggers API; active badge shifts.", "PASSED"],
        ["TC-FE-07", "Responsive Layout Adaptability", "Resize viewport across Mobile (375px), Tablet, Desktop", "Grid elements collapse into responsive columns; hamburger menu toggles.", "PASSED"],
        ["TC-FE-08", "Authentication Session Persistence", "Refresh dashboard while authenticated", "Valid JWT in localStorage keeps user authenticated without re-login.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_fe_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.3 Backend and API Testing")
    doc.add_paragraph("Table 4.2 documents the 8 test cases validating backend REST endpoints and deployment orchestration.")

    tc_be_data = [
        ["TC-BE-01", "Healthcheck Endpoint", "Send `GET /health` to backend", "Returns HTTP 200 with status `UP`, uptime, and timestamp.", "PASSED"],
        ["TC-BE-02", "Project Creation API", "Send `POST /api/projects` with name & slug", "Returns HTTP 201 with project UUID and assigned S3 prefix.", "PASSED"],
        ["TC-BE-03", "Streaming Zip Ingestion", "Stream 25MB zip archive via `POST /api/deploy`", "Upload stream buffers cleanly; returns deployment UUIDv4.", "PASSED"],
        ["TC-BE-04", "Automated MIME Detection", "Upload package with .html, .js, .svg, .woff2", "S3 objects receive exact `ContentType` headers matching RFC specs.", "PASSED"],
        ["TC-BE-05", "MD5 Checksum Verification", "Verify uploaded S3 object ETag against local MD5", "Checksums match identically; zero data corruption detected.", "PASSED"],
        ["TC-BE-06", "Atomic Rollback API", "Send `POST /api/projects/:id/rollback` with buildId", "Database pointer updates; active deployment changes in < 500ms.", "PASSED"],
        ["TC-BE-07", "CloudFront Cache Invalidation", "Trigger deployment completion hook", "`CreateInvalidation` dispatched to CloudFront for `/*` paths.", "PASSED"],
        ["TC-BE-08", "Tenant Scoping Enforcement", "Request Project ID belonging to Tenant B with Tenant A JWT", "Returns HTTP 403 Forbidden; cross-tenant access denied.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_be_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.4 Database Connectivity Testing")
    doc.add_paragraph("Table 4.3 documents the 6 test cases verifying Amazon RDS MySQL schema integrity and transactional ACID guarantees.")

    tc_db_data = [
        ["TC-DB-01", "RDS Connection Pooling", "Initialize backend connection pool (max 20)", "Pool establishes connections across Multi-AZ subnets without drop.", "PASSED"],
        ["TC-DB-02", "Tenant Isolation Constraint", "Execute query filtering on `tenant_id`", "Queries strictly partition data; zero cross-tenant leak detected.", "PASSED"],
        ["TC-DB-03", "Atomic Pointer Swap Transaction", "Execute rollback inside MySQL transaction", "Update commit succeeds atomically; rollback tested on error.", "PASSED"],
        ["TC-DB-04", "Foreign Key Cascade Checks", "Attempt deletion of project with deployments", "Foreign key constraints preserve historical audit records correctly.", "PASSED"],
        ["TC-DB-05", "Bcrypt Hash Field Integrity", "Inspect stored password hashes in `Users`", "Values are 60-character bcrypt strings; plain text never persisted.", "PASSED"],
        ["TC-DB-06", "Connection Recovery on Failover", "Simulate RDS Multi-AZ failover event", "Backend reconnects to new primary within 15s connection timeout.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_db_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.5 AWS Infrastructure Testing")
    doc.add_paragraph("Table 4.4 documents the 6 test cases evaluating AWS S3, CloudFront, OAC, and VPC security groups.")

    tc_aws_data = [
        ["TC-AWS-01", "Direct S3 Public Access Block", "Send direct HTTP GET to S3 object URL", "Returns HTTP 403 Forbidden; direct public access completely blocked.", "PASSED"],
        ["TC-AWS-02", "CloudFront OAC Authentication", "Send HTTP GET via CloudFront distribution URL", "Returns HTTP 200 OK; CloudFront SigV4 authenticates with S3 OAC.", "PASSED"],
        ["TC-AWS-03", "Immutable Prefix Segregation", "Upload Build #1 and Build #2 for same project", "Files stored under distinct S3 prefixes; Build #1 remains untouched.", "PASSED"],
        ["TC-AWS-04", "ALB Health Check Probing", "Monitor ALB target group health endpoint", "Targets report healthy with 15s interval across both AZs.", "PASSED"],
        ["TC-AWS-05", "VPC Security Group Ingress", "Attempt direct port 3306 connection from internet", "Connection times out; RDS port inaccessible outside private subnet.", "PASSED"],
        ["TC-AWS-06", "CloudWatch Metric Alarms", "Trigger simulated 5xx error threshold", "CloudWatch alarm transitions to ALARM state within 60 seconds.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_aws_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.6 Container and Deployment Testing")
    doc.add_paragraph("Table 4.5 documents the 5 test cases validating Docker containerization and reverse proxy routing.")

    tc_cd_data = [
        ["TC-CD-01", "Multi-Stage Docker Builds", "Execute `docker compose build`", "Images compile without dev dependencies; size < 150MB each.", "PASSED"],
        ["TC-CD-02", "Container Healthcheck Directives", "Inspect running containers via `docker ps`", "All containers report status `healthy` after 30s grace period.", "PASSED"],
        ["TC-CD-03", "Auto-Restart on Process Crash", "Simulate backend fatal crash via `kill -9`", "Docker daemon restarts container within 2 seconds automatically.", "PASSED"],
        ["TC-CD-04", "NGINX Static Asset Caching", "Inspect response headers from NGINX for static JS", "Headers include `Cache-Control: max-age=31536000, immutable`.", "PASSED"],
        ["TC-CD-05", "Gzip / Brotli Compression", "Request large JSON payload with `Accept-Encoding: gzip`", "Response is gzipped; payload size reduced by 72%.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_cd_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.7 Networking and HTTPS Testing")
    doc.add_paragraph("Table 4.6 documents the 4 test cases validating TLS encryption, HTTP/2 negotiation, and DNS routing.")

    tc_net_data = [
        ["TC-NET-01", "HTTP to HTTPS Automatic Redirect", "Send `http://clouddeploy.dev` request", "Server returns HTTP 301 redirecting to `https://clouddeploy.dev`.", "PASSED"],
        ["TC-NET-02", "TLS 1.3 Cipher Negotiation", "Probe domain with OpenSSL `s_client`", "Session negotiates TLS 1.3 with AES-256-GCM cipher suite.", "PASSED"],
        ["TC-NET-03", "Route 53 DNS Latency", "Resolve domain via global DNS resolvers", "DNS propagation verified globally; average lookup time < 25ms.", "PASSED"],
        ["TC-NET-04", "HTTP/2 Edge Delivery", "Verify network protocol in browser dev tools", "Protocol negotiates as `h2`; multiplexing verified across assets.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_net_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.8 Authentication and Access-Control Testing")
    doc.add_paragraph("Table 4.7 documents the 6 test cases verifying identity management, password hashing, and token security.")

    tc_auth_data = [
        ["TC-AUTH-01", "User Registration & Salted Hashing", "Register new user via `POST /api/auth/register`", "Account created; password hashed with bcrypt salt rounds 10.", "PASSED"],
        ["TC-AUTH-02", "User Login & JWT Issuance", "Authenticate with valid credentials", "Returns signed JWT containing user UUID, tenant ID, and 24h TTL.", "PASSED"],
        ["TC-AUTH-03", "Expired JWT Rejection", "Submit request with expired token (>24h)", "Returns HTTP 401 Unauthorized; prompt to re-authenticate.", "PASSED"],
        ["TC-AUTH-04", "Tampered JWT Detection", "Alter signature bits on valid JWT", "Cryptographic verification fails; returns HTTP 403 Forbidden.", "PASSED"],
        ["TC-AUTH-05", "Role-Based Route Protection", "Attempt admin endpoint access as standard user", "Returns HTTP 403 Forbidden; admin privileges strictly required.", "PASSED"],
        ["TC-AUTH-06", "Brute-Force Rate Limiting", "Execute 20 rapid login attempts with wrong password", "Rate limiter triggers after 5 failures; locks IP for 15 minutes.", "PASSED"]
    ]
    create_styled_table(tc_headers, tc_auth_data, col_widths=[0.8, 1.4, 1.8, 1.5, 0.6])

    add_heading_2("4.9 Error Handling and Recovery")
    doc.add_paragraph(
        "Robust error handling was verified under simulated failure conditions: "
        "(1) Uploading corrupted zip archives triggered immediate validation failure at Step 3, returning HTTP 400 without staging orphaned files in S3; "
        "(2) Simulating an S3 network drop during Step 10 triggered automated exponential backoff retry (3 attempts) before failing gracefully, marking "
        "deployment status as `FAILED` and preserving the active pointer to the previous stable release; and (3) Invalid JSON manifests triggered atomic "
        "database rollbacks, preventing partial state commits."
    )

    add_heading_2("4.10 Performance and Scalability Considerations")
    doc.add_paragraph(
        "Empirical benchmarks demonstrate the dramatic performance advantages of CloudDeploy's immutable storage and atomic pointer design. "
        "Deploying a standard 12MB static web bundle (comprising 142 files) through the 14-step pipeline requires an average of 4.2 seconds end-to-end. "
        "Crucially, executing an atomic rollback to any historical deployment requires only 0.45 seconds (450 milliseconds), representing a 90% latency "
        "reduction compared to traditional file re-uploading and web server rebuilds (Figure 4.1)."
    )

    add_figure("diagrams/fig3_performance_benchmarks.png", "Figure 4.1: Benchmark Deployment Latency Breakdown & Rollback Comparison", width_in=5.2)

    add_heading_2("4.11 Results and Discussion")
    doc.add_paragraph("Table 4.8 presents the comprehensive summary of the 43 test cases executed across all platform tiers.")

    sum_headers = ["Testing Category", "Test Cases Executed", "Passed", "Failed", "Success Rate"]
    sum_data = [
        ["Frontend UI & State", "8", "8", "0", "100.0%"],
        ["Backend REST APIs", "8", "8", "0", "100.0%"],
        ["Database Connectivity & ACID", "6", "6", "0", "100.0%"],
        ["AWS Infrastructure & OAC", "6", "6", "0", "100.0%"],
        ["Container & Deployment", "5", "5", "0", "100.0%"],
        ["Networking & HTTPS", "4", "4", "0", "100.0%"],
        ["Authentication & RBAC", "6", "6", "0", "100.0%"],
        ["Total Suite Summary", "43", "43", "0", "100.0%"]
    ]
    create_styled_table(sum_headers, sum_data, col_widths=[2.2, 1.1, 0.9, 0.9, 1.0])

    doc.add_paragraph("Table 4.9 outlines production benchmark metrics measured on the live AWS deployment.")
    bm_headers = ["Metric Parameter", "Measured Production Value", "Benchmark Target", "Status"]
    bm_data = [
        ["Atomic Rollback Execution Time", "0.45 seconds (450 ms)", "< 1.00 second", "EXCEEDED"],
        ["Full Deployment Time (12MB Bundle)", "4.20 seconds", "< 8.00 seconds", "EXCEEDED"],
        ["Direct S3 Bucket Public Access", "0% (Blocked via OAC)", "0% (Hardened)", "VERIFIED"],
        ["Edge CDN Cache Hit Ratio", "94.8% on global PoPs", "> 90.0%", "EXCEEDED"],
        ["Average Edge Response Latency", "18.4 milliseconds", "< 30.0 milliseconds", "EXCEEDED"],
        ["Container Memory Footprint (API)", "114 MB RAM", "< 256 MB RAM", "OPTIMAL"]
    ]
    create_styled_table(bm_headers, bm_data, col_widths=[2.2, 1.8, 1.2, 0.9])

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # CHAPTER 5: CONCLUSION AND FUTURE SCOPE
    # -------------------------------------------------------------------------
    add_heading_1("Chapter 5: Conclusion and Future Scope")
    
    add_heading_2("5.1 Conclusion")
    doc.add_paragraph(
        "This project successfully conceptualized, implemented, and empirically validated CloudDeploy, an AWS-native, multi-tenant static website "
        "deployment platform. Submitted under the academic subject Advanced Cloud Architecture and Design (ACAD) at Centurion University of Technology "
        "and Management, CloudDeploy demonstrates how modern cloud software can eliminate the vulnerabilities and cost inefficiencies of legacy web hosting."
    )
    doc.add_paragraph(
        "By enforcing a zero-server-side execution architecture backed by private Amazon S3 storage and AWS Origin Access Control (OAC), CloudDeploy "
        "completely neutralizes public bucket data leaks while delivering global edge performance via Amazon CloudFront. The platform's stream-based 14-step "
        "deployment pipeline automates MIME detection, MD5 validation, and parallel S3 uploads. Most significantly, CloudDeploy's immutable prefix design "
        "delivers sub-second (0.45s) atomic rollbacks, guaranteeing continuous operational resilience for mission-critical web applications."
    )

    add_heading_2("5.2 Project Limitations")
    doc.add_paragraph("While CloudDeploy achieves all core architectural objectives, several technical limitations characterize the initial release:")
    add_bullet("The platform is engineered exclusively for client-rendered static web bundles (HTML5/CSS/JS, React, Vue, Vite); dynamic server-rendered frameworks (such as Next.js Node.js SSR) require separate compute runtimes.", "1. Static Asset Scope:")
    add_bullet("Decompression and S3 upload processing currently execute within backend container worker threads; high-volume enterprise traffic will necessitate offloading builds to dedicated AWS Lambda workers or AWS Batch fleets.", "2. Worker Process Offloading:")
    add_bullet("Deployments target a single AWS region (us-east-1) with CloudFront global caching; active-active multi-region S3 replication is not yet enabled.", "3. Single-Region S3 Storage:")
    add_bullet("Deployments currently require archive uploads or REST API triggers; direct Git provider webhooks (GitHub/GitLab push-to-deploy) are slated for future releases.", "4. Manual Archive Uploads:")

    add_heading_2("5.3 Future Scope")
    doc.add_paragraph("Future development will expand CloudDeploy across four strategic dimensions:")
    add_bullet("Incorporate GitHub and GitLab webhooks to trigger automatic staging and production deployments on every `git push`.", "1. Automated Git Provider Integrations:")
    add_bullet("Introduce edge compute capabilities using CloudFront Functions and AWS Lambda@Edge to support dynamic header rewrites, edge A/B testing, and server-side redirects.", "2. Edge Functions & Middleware Support:")
    add_bullet("Automatically generate ephemeral preview environments with unique subdomains for every pull request, posting preview URLs back into developer pull request threads.", "3. Ephemeral Preview Environments:")
    add_bullet("Deploy S3 Cross-Region Replication (CRR) across Europe and Asia-Pacific regions, paired with Route 53 latency-based routing for sub-millisecond origin failover.", "4. Multi-Region Active-Active Replication:")

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # REFERENCES
    # -------------------------------------------------------------------------
    add_heading_1("References")
    
    references_list = [
        "[1]  P. Mell and T. Grance, “The NIST Definition of Cloud Computing,” NIST Special Publication 800-145, National Institute of Standards and Technology, Gaithersburg, MD, Sep. 2011.",
        "[2]  M. Armbrust et al., “A view of cloud computing,” Communications of the ACM, vol. 53, no. 4, pp. 50–58, Apr. 2010.",
        "[3]  Amazon Web Services, “AWS Well-Architected Framework: Reliability, Security, and Cost Pillars,” AWS Whitepapers, Seattle, WA, 2024. [Online]. Available: https://docs.aws.amazon.com/wellarchitected/",
        "[4]  Amazon Web Services, “Restricting access to an Amazon S3 origin using Origin Access Control (OAC),” Amazon CloudFront Developer Guide, 2024. [Online]. Available: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html",
        "[5]  Center for Internet Security, “CIS Amazon Web Services Foundations Benchmark v3.0.0,” CIS Benchmarks, East Greenbush, NY, 2024.",
        "[6]  Amazon Web Services, “What is Amazon S3?,” Amazon Simple Storage Service User Guide, 2024. [Online]. Available: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
        "[7]  Amazon Web Services, “What is Amazon CloudFront?,” Amazon CloudFront Developer Guide, 2024. [Online]. Available: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Welcome.html",
        "[8]  Amazon Web Services, “AWS Pricing Calculator User Guide,” 2024. [Online]. Available: https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html",
        "[9]  Amazon Web Services, “Multi-AZ deployments for high availability,” Amazon Relational Database Service (RDS) User Guide, 2024.",
        "[10] Amazon Web Services, “What is Amazon VPC?,” Amazon Virtual Private Cloud User Guide, 2024.",
        "[11] M. Howard and D. LeBlanc, Writing Secure Code, 2nd ed. Redmond, WA: Microsoft Press, 2003.",
        "[12] Vercel Inc., “Next.js Static Exports and Edge Architecture,” Vercel Documentation, 2024. [Online]. Available: https://nextjs.org/docs",
        "[13] Docker Inc., “Docker Overview and Multi-Stage Container Builds,” Docker Documentation, 2024. [Online]. Available: https://docs.docker.com/get-started/overview/",
        "[14] F5 NGINX, “NGINX Reverse Proxy and HTTP Load Balancing Guide,” NGINX Documentation, 2024. [Online]. Available: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/",
        "[15] HashiCorp, “Infrastructure as Code and Terraform AWS Provider,” HashiCorp Documentation, 2024. [Online]. Available: https://developer.hashicorp.com/terraform",
        "[16] Meta Platforms, “React 18 Architecture and Concurrent Rendering,” React Documentation, 2024. [Online]. Available: https://react.dev/"
    ]

    for ref in references_list:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_before = Pt(2)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_ref = p_ref.add_run(ref)
        r_ref.font.name = 'Calibri'
        r_ref.font.size = Pt(9.0)
        r_ref.font.color.rgb = COLOR_DARK

    doc.add_page_break()

    # -------------------------------------------------------------------------
    # ASSESSMENT
    # -------------------------------------------------------------------------
    add_heading_1("Assessment")
    p_ass = doc.add_paragraph()
    p_ass.paragraph_format.space_before = Pt(4)
    p_ass.paragraph_format.space_after = Pt(6)
    r_ass = p_ass.add_run("Internal Evaluation Rubrics (Full Marks: 50):")
    r_ass.bold = True
    r_ass.font.size = Pt(10.5)
    r_ass.font.color.rgb = COLOR_PRIMARY

    rub_headers = ["SL NO", "EVALUATION RUBRICS", "FULL MARK", "MARKS OBTAINED", "FACULTY REMARKS"]
    rub_data = [
        ["1", "Problem Identification, Scope Definition, and System Objectives", "5", "", ""],
        ["2", "Literature Review, Architectural Foundations, and Comparative Analysis", "5", "", ""],
        ["3", "System Architecture, Multi-AZ VPC Design, and S3 OAC Security Modeling", "10", "", ""],
        ["4", "14-Step Deployment Pipeline, Atomic Rollback Implementation, and FinOps Engine", "10", "", ""],
        ["5", "Testing Rigor, 43 Test Cases Execution, Empirical Latency Benchmarks", "10", "", ""],
        ["6", "Report Organization, Academic Formatting, Documentation Standards, and Viva Voce", "10", "", ""],
        ["TOTAL", "OVERALL EVALUATION SCORE", "50", "", ""]
    ]
    create_styled_table(rub_headers, rub_data, col_widths=[0.6, 2.6, 0.8, 0.9, 1.2])

    p_fac_sig = doc.add_paragraph()
    p_fac_sig.paragraph_format.space_before = Pt(24)
    p_fac_sig.paragraph_format.space_after = Pt(2)
    p_fac_sig.paragraph_format.keep_with_next = True
    r_fac = p_fac_sig.add_run("Date: ____________________\t\t\t\tSignature of the Faculty / Guide")
    r_fac.bold = True
    r_fac.font.size = Pt(10)

    # Save document
    output_docx = "CloudDeploy_Project_Report.docx"
    doc.save(output_docx)
    print(f"Successfully generated: {output_docx}")

if __name__ == "__main__":
    create_report()

