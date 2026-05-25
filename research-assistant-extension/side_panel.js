// // // document.addEventListener('DOMContentLoaded', () => {
// // //     // Retrieve the stored research notes with the help of researchNotes key
// // //     chrome.storage.local.get(['researchNotes'], function (result) {
// // //         if (result.researchNotes) {
// // //             document.getElementById('notes').value = result.researchNotes;
// // //         }
// // //     });
// // //     document.getElementById('summarizeButton').addEventListener('click', summarizeText);
// // //     document.getElementById('saveNotes').addEventListener('click', saveNotes);
// // // });

// // // async function summarizeText() {
// // //     try {
// // //         // Get the current active tab
// // //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //         // get the selected text from the active tab using content script
// // //         const [{ result }] = await chrome.scripting.executeScript({
// // //             target: { tabId: tab.id },
// // //             function: () => window.getSelection().toString()
// // //         });
// // //         // validate if there is no selected text present in the variable result
// // //         if (!result) {
// // //             showResult('Please select some text to summarize.');
// // //             return;
// // //         }

// // //         // API call to the backend server to summarize the text
// // //         // fetch from the end point and pass the selected text as a parameter in the request body
// // //         const response = await fetch('http://localhost:8080/api/research/process', {
// // //             method: 'POST',
// // //             headers: {
// // //                 'Content-Type': 'application/json'
// // //             },
// // //             body: JSON.stringify({ content: result, operation: 'summarize' })
// // //         });

// // //         // validate if the response is not successful
// // //         if (!response.ok) {
// // //             throw new Error(`API Error: ${response.status}`);
// // //         }

// // //         // if no error is there then get the summarized text from the response
// // //         const text = await response.text();
// // //         // replace newlines with <br> for HTML display
// // //         showResult(text.replace(/\n/g, '<br>'));


// // //     } catch (error) {
// // //         showResult('Error: ' + error.message);
// // //     }
// // // }

// // // async function saveNotes() {
// // //     const notes = document.getElementById('notes').value;
// // //     chrome.storage.local.set({ 'researchNotes': notes }, function () {
// // //         alert('Notes saved successfully!');
// // //     });
// // // }

// // // // function will display anything that we passed onto to the resultID
// // // function showResult(content) {
// // //     document.getElementById('results').innerHTML = `<div class = "result-item"><div class="result-content">${content}</div></div>`;
// // // }

// // /* ═══════════════════════════════════════════════════════
// //    Research Assistant — side_panel.js
// //    Bugs fixed: delete, expand, content rendering
// //    New: export (PDF/DOC), tooltips, elegant UI
// //    ═══════════════════════════════════════════════════════ */

// //    'use strict';

// //    // ── State ──────────────────────────────────────────────
// //    let notes = [];
// //    let lastSummary = '';

// //    // ── Boot ───────────────────────────────────────────────
// //    document.addEventListener('DOMContentLoaded', () => {
// //      loadNotes();
// //      bindButtons();
// //      initTooltips();
// //    });

// //    // ── Button bindings ────────────────────────────────────
// //    function bindButtons() {
// //      document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// //      document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// //      document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// //      document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
// //      document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// //      document.getElementById('noteExportPdf').addEventListener('click', () => {
// //        exportSingleNote(window._activeNoteId, 'pdf');
// //      });
// //      document.getElementById('noteExportDoc').addEventListener('click', () => {
// //        exportSingleNote(window._activeNoteId, 'doc');
// //      });
// //      document.getElementById('noteExportModal').addEventListener('click', (e) => {
// //        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// //      });

// //      document.getElementById('exportBtn').addEventListener('click', openExportModal);
// //      document.getElementById('closeExport').addEventListener('click', closeExportModal);
// //      document.getElementById('exportPdf').addEventListener('click', () => exportNotes('pdf'));
// //      document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// //      // Close modal on backdrop click
// //      document.getElementById('exportModal').addEventListener('click', (e) => {
// //        if (e.target === document.getElementById('exportModal')) closeExportModal();
// //      });
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 1 — Summarise selected text on page
// //    // ══════════════════════════════════════════════════════
// //    async function summarizeSelection() {
// //      try {
// //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //        const [{ result: sel }] = await chrome.scripting.executeScript({
// //          target: { tabId: tab.id },
// //          function: () => window.getSelection().toString()
// //        });

// //        if (!sel || !sel.trim()) {
// //          showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// //          return;
// //        }

// //        showResult('Summarising…', false);
// //        hideSavePromptBar();

// //        const res = await fetch('http://localhost:8080/api/research/process', {
// //          method: 'POST',
// //          headers: { 'Content-Type': 'application/json' },
// //          body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
// //        });
// //        if (!res.ok) throw new Error('API error ' + res.status);

// //        lastSummary = (await res.text()).trim();
// //        showResult(lastSummary, true);       // true = plain text, not HTML
// //        showSavePromptBar();

// //      } catch (err) {
// //        showResult('❌ ' + err.message, false);
// //        hideSavePromptBar();
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 2 — Bookmark: auto-summarise selection or
// //    //             save page URL — no manual pasting needed
// //    // ══════════════════════════════════════════════════════
// //    async function bookmarkPage() {
// //      try {
// //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //        const [{ result: sel }] = await chrome.scripting.executeScript({
// //          target: { tabId: tab.id },
// //          function: () => window.getSelection().toString()
// //        });

// //        const content = (sel || '').trim();

// //        if (!content) {
// //          // No selection — save page as a plain bookmark
// //          const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// //          saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// //          toast('📌 Page bookmarked!');
// //          return;
// //        }

// //        toast('Summarising & saving…');
// //        const res = await fetch('http://localhost:8080/api/research/process', {
// //          method: 'POST',
// //          headers: { 'Content-Type': 'application/json' },
// //          body: JSON.stringify({ content, operation: 'summarize' })
// //        });
// //        if (!res.ok) throw new Error('API error ' + res.status);

// //        const summary = (await res.text()).trim();
// //        saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// //        toast('✅ Bookmarked & summarised!');

// //      } catch (err) {
// //        toast('❌ ' + err.message);
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 3 — Save the summary shown in result box
// //    // ══════════════════════════════════════════════════════
// //    function saveSummaryAsNote() {
// //      if (!lastSummary) return;
// //      saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// //      hideSavePromptBar();
// //      toast('✅ Summary saved to notes!');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 4 — Save manually typed note
// //    // ══════════════════════════════════════════════════════
// //    function saveManualNote() {
// //      const el = document.getElementById('quickNoteInput');
// //      const text = el.value.trim();
// //      if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// //      saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// //      el.value = '';
// //      toast('✅ Note saved!');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // CORE — Add note to state + storage + re-render
// //    // ══════════════════════════════════════════════════════
// //    function saveNote({ title, content, type }) {
// //      const note = {
// //        id: 'n' + Date.now(),          // safe prefix avoids pure-numeric ID edge cases
// //        title: title || 'Untitled',
// //        content: content || '',
// //        type: type || 'manual',
// //        pinned: false,
// //        expanded: false,
// //        createdAt: new Date().toISOString()
// //      };
// //      notes.unshift(note);
// //      persistNotes();
// //      renderNotes();
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 5 — Pin / unpin   (uses data-id, not inline onclick)
// //    // ══════════════════════════════════════════════════════
// //    function togglePin(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      note.pinned = !note.pinned;
// //      persistNotes();
// //      renderNotes();
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 6 — Delete   ← BUG FIX: was using bad filter
// //    // ══════════════════════════════════════════════════════
// //    function deleteNote(id) {
// //      const idx = notes.findIndex(n => n.id === id);
// //      if (idx === -1) return;
// //      notes.splice(idx, 1);
// //      persistNotes();
// //      renderNotes();
// //      toast('🗑 Note deleted');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 7 — Expand / collapse note content
// //    //   ← BUG FIX: toggling .open class on the .note-expand
// //    //     element directly found by id, no innerHTML re-render
// //    // ══════════════════════════════════════════════════════
// //    function toggleExpand(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      note.expanded = !note.expanded;
// //      // Directly show/hide the expand div — no re-render needed
// //      const expandEl = document.getElementById('exp-' + id);
// //      if (expandEl) expandEl.classList.toggle('open', note.expanded);

// //      // Rotate the chevron icon on the title button
// //      const titleBtn = document.getElementById('tbtn-' + id);
// //      if (titleBtn) {
// //        const chev = titleBtn.querySelector('.chev');
// //        if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 8 — Export notes (PDF or DOC/TXT)
// //    // ══════════════════════════════════════════════════════
// //    function openExportModal() {
// //      if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// //      document.getElementById('exportModal').classList.remove('hidden');
// //    }
// //    function closeExportModal() {
// //      document.getElementById('exportModal').classList.add('hidden');
// //    }

// //    function exportNotes(format) {
// //      closeExportModal();

// //      if (format === 'pdf') {
// //        exportAsPdf();
// //      } else {
// //        exportAsDoc();
// //      }
// //    }

// //    function exportAsPdf() {
// //      // Build a printable HTML page and open it in a new tab for the user to "Print → Save as PDF"
// //      const sorted = getSorted();
// //      let rows = sorted.map(n => {
// //        const date = formatDate(n.createdAt);
// //        const safeTitle = escHTML(n.title);
// //        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// //        const pinMark = n.pinned ? ' 📌' : '';
// //        return `
// //          <div class="note">
// //            <div class="note-head">
// //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// //              <span class="date">${date}</span>
// //            </div>
// //            <h2>${safeTitle}${pinMark}</h2>
// //            <p>${safeContent}</p>
// //          </div>`;
// //      }).join('');

// //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>Research Notes Export</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px;page-break-inside:avoid}
// //          .note-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
// //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .pin{font-size:10px;color:#e67700;font-weight:600}
// //          .date{font-size:10px;color:#aaa;margin-left:auto}
// //          @media print{body{padding:16px}.note{border:1px solid #ccc}}
// //        </style>
// //      </head><body>
// //        <h1>Research Notes</h1>
// //        <div class="meta">Exported ${new Date().toLocaleString()} · ${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
// //        ${rows}
// //        <script>window.onload=()=>window.print();<\/script>
// //      </body></html>`;

// //      const blob = new Blob([html], { type: 'text/html' });
// //      const url = URL.createObjectURL(blob);
// //      chrome.tabs.create({ url });
// //      toast('📄 PDF export opened — use Print → Save as PDF');
// //    }

// //    function exportAsDoc() {
// //      // Build a plain-text file downloadable as .txt (Word-compatible)
// //      const sorted = getSorted();
// //      const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// //      sorted.forEach((n, i) => {
// //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// //        lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// //        lines.push(n.title);
// //        lines.push('');
// //        lines.push(n.content);
// //        lines.push('');
// //      });

// //      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
// //      const url = URL.createObjectURL(blob);
// //      const a = document.createElement('a');
// //      a.href = url;
// //      a.download = 'research-notes.txt';
// //      a.click();
// //      URL.revokeObjectURL(url);
// //      toast('📝 Notes downloaded as .txt');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 9 — Export a single note (PDF or DOC)
// //    // ══════════════════════════════════════════════════════
// //    function openNoteExportModal(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      window._activeNoteId = id;
// //      // Show note title in the modal so user knows which note they're exporting
// //      document.getElementById('noteExportTitle').textContent = note.title;
// //      document.getElementById('noteExportModal').classList.remove('hidden');
// //    }

// //    function closeNoteExportModal() {
// //      document.getElementById('noteExportModal').classList.add('hidden');
// //      window._activeNoteId = null;
// //    }

// //    function exportSingleNote(id, format) {
// //      closeNoteExportModal();
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;

// //      if (format === 'pdf') {
// //        exportSingleNoteAsPdf(note);
// //      } else {
// //        exportSingleNoteAsDoc(note);
// //      }
// //    }

// //    function exportSingleNoteAsPdf(note) {
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const safeTitle = escHTML(note.title);
// //      const safeContent = escHTML(note.content).replace(/\n/g, '<br>');
// //      const pinMark = note.pinned ? '<span class="pin">📌 Pinned</span>' : '';

// //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>${safeTitle}</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
// //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.4px}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .pin{font-size:11px;color:#e67700;font-weight:600}
// //          .date{font-size:11px;color:#8a90a8}
// //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// //          @media print{body{padding:20px}}
// //        </style>
// //      </head><body>
// //        <div class="meta">
// //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// //          ${pinMark}
// //          <span class="date">${date}</span>
// //        </div>
// //        <h1>${safeTitle}</h1>
// //        <p>${safeContent}</p>
// //        <script>window.onload=()=>window.print();<\/script>
// //      </body></html>`;

// //      const blob = new Blob([html], { type: 'text/html' });
// //      chrome.tabs.create({ url: URL.createObjectURL(blob) });
// //      toast('📄 Note opened — use Print → Save as PDF');
// //    }

// //    function exportSingleNoteAsDoc(note) {
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const lines = [
// //        note.title,
// //        '='.repeat(Math.min(note.title.length, 60)),
// //        `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// //        `Date: ${date}`,
// //        '',
// //        note.content
// //      ];

// //      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
// //      const url = URL.createObjectURL(blob);
// //      const a = document.createElement('a');
// //      a.href = url;
// //      // Slugify the title for the filename
// //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// //      a.download = `note-${slug}.txt`;
// //      a.click();
// //      URL.revokeObjectURL(url);
// //      toast('📝 Note downloaded as .txt');
// //    }


// //    function loadNotes() {
// //      chrome.storage.local.get(['researchNotesV2'], (result) => {
// //        notes = result.researchNotesV2 || [];
// //        renderNotes();
// //      });
// //    }
// //    function persistNotes() {
// //      chrome.storage.local.set({ researchNotesV2: notes });
// //    }

// //    // ── Render ─────────────────────────────────────────────
// //    function renderNotes() {
// //      const list = document.getElementById('notesList');
// //      const countEl = document.getElementById('noteCount');
// //      countEl.textContent = notes.length;

// //      if (!notes.length) {
// //        list.innerHTML = `
// //          <div class="empty-state">
// //            <span class="empty-icon">🗒️</span>
// //            <p>No notes yet.<br>Summarise text or bookmark a page to get started.</p>
// //          </div>`;
// //        return;
// //      }

// //      list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// //      // ── Attach events via JS (NOT inline onclick) ─────────
// //      // This is the correct fix: event delegation from the list
// //      list.querySelectorAll('.note-card').forEach(card => {
// //        const id = card.dataset.id;

// //        // Title / expand button
// //        const titleBtn = card.querySelector('.note-title-btn');
// //        if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));

// //        // Download (per-note export) button
// //        const dlBtn = card.querySelector('.dl-btn');
// //        if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));

// //        // Pin button
// //        const pinBtn = card.querySelector('.pin-btn');
// //        if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));

// //        // Delete button
// //        const delBtn = card.querySelector('.del-btn');
// //        if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// //      });
// //    }

// //    // ── Card HTML builder ──────────────────────────────────
// //    // NOTE: content is stored and displayed as PLAIN TEXT.
// //    // escHTML() is used for the preview/title only.
// //    // The expand area uses textContent via CSS white-space:pre-wrap
// //    // so no escaping needed and <br> injection bug is gone.
// //    function buildCardHTML(note) {
// //      const safeTitle = escHTML(note.title);
// //      const safePreview = escHTML(truncate(note.content, 120));
// //      // For the expand area we store the raw content and set
// //      // it via textContent after insertion (see renderNotes event binding below)
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// //      const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// //      const expandOpen = note.expanded ? 'open' : '';
// //      const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// //      return `
// //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// //          <div class="note-card-top">
// //            <button class="note-title-btn" id="tbtn-${note.id}"
// //              aria-expanded="${note.expanded}"
// //              aria-label="Toggle note: ${safeTitle}"
// //              data-tooltip="Click to read the full note">
// //              <span class="note-title-text">${safeTitle}</span>
// //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// //            </button>
// //            <div class="card-actions">
// //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// //              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
// //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
// //              </button>
// //              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
// //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
// //              </button>
// //            </div>
// //          </div>
// //          <div class="note-preview">${safePreview}</div>
// //          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
// //          <div class="note-footer">
// //            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
// //            <span class="note-date">${date}</span>
// //            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
// //          </div>
// //        </div>`;
// //    }

// //    // ── After render: inject full content as textContent ───
// //    // This completely avoids the <br> / HTML injection bug.
// //    // We override renderNotes to do a second pass:
// //    const _renderNotes = renderNotes;
// //    // Re-assign with post-pass
// //    (function patchRender() {
// //      const original = window.renderNotes || renderNotes;
// //      // After innerHTML is set, fill expand divs with plain text
// //      const observer = new MutationObserver(() => {
// //        document.querySelectorAll('.note-expand').forEach(el => {
// //          const card = el.closest('.note-card');
// //          if (!card) return;
// //          const id = card.dataset.id;
// //          if (!id || el._filled) return;
// //          const note = notes.find(n => n.id === id);
// //          if (!note) return;
// //          el.textContent = note.content;   // plain text, no escaping needed
// //          el._filled = true;
// //        });
// //      });
// //      observer.observe(document.getElementById('notesList'), { childList: true, subtree: false });
// //    })();

// //    // ── Helpers ────────────────────────────────────────────
// //    function getSorted() {
// //      return [
// //        ...notes.filter(n => n.pinned),
// //        ...notes.filter(n => !n.pinned)
// //      ];
// //    }

// //    function autoTitle(text) {
// //      const clean = text.replace(/\n/g, ' ').trim();
// //      const words = clean.split(/\s+/).slice(0, 7).join(' ');
// //      return clean.split(/\s+/).length > 7 ? words + '…' : words;
// //    }

// //    function truncate(text, maxLen) {
// //      const flat = text.replace(/\n/g, ' ');
// //      return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// //    }

// //    function escHTML(str) {
// //      return String(str)
// //        .replace(/&/g, '&amp;')
// //        .replace(/</g, '&lt;')
// //        .replace(/>/g, '&gt;')
// //        .replace(/"/g, '&quot;');
// //    }

// //    function formatDate(iso) {
// //      const d = new Date(iso);
// //      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
// //        + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// //    }

// //    // ── Result box helpers ──────────────────────────────────
// //    function showResult(text, isPlain) {
// //      const box = document.getElementById('resultBox');
// //      const content = document.getElementById('resultContent');
// //      if (isPlain) {
// //        content.textContent = text;   // plain text — safe, no XSS
// //      } else {
// //        content.innerHTML = text;     // only used for internal status messages
// //      }
// //      box.classList.remove('hidden');
// //    }

// //    function showSavePromptBar() {
// //      document.getElementById('savePromptBar').classList.remove('hidden');
// //    }
// //    function hideSavePromptBar() {
// //      document.getElementById('savePromptBar').classList.add('hidden');
// //      lastSummary = '';
// //    }

// //    // ── Toast ──────────────────────────────────────────────
// //    function toast(msg) {
// //      const el = document.getElementById('toast');
// //      el.textContent = msg;
// //      el.classList.add('show');
// //      clearTimeout(el._tid);
// //      el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// //    }

// //    // ── Tooltip system ─────────────────────────────────────
// //    function initTooltips() {
// //      const tip = document.getElementById('tooltip');
// //      let hoverEl = null;
// //      let showTid = null;

// //      document.addEventListener('mouseover', (e) => {
// //        const target = e.target.closest('[data-tooltip]');
// //        if (!target) return;
// //        hoverEl = target;
// //        clearTimeout(showTid);
// //        showTid = setTimeout(() => {
// //          const msg = target.dataset.tooltip;
// //          if (!msg) return;
// //          tip.textContent = msg;
// //          positionTooltip(tip, target);
// //          tip.classList.add('visible');
// //          tip.removeAttribute('aria-hidden');
// //        }, 500);
// //      });

// //      document.addEventListener('mouseout', (e) => {
// //        if (!e.target.closest('[data-tooltip]')) return;
// //        clearTimeout(showTid);
// //        tip.classList.remove('visible');
// //        tip.setAttribute('aria-hidden', 'true');
// //        hoverEl = null;
// //      });
// //    }

// //    function positionTooltip(tip, target) {
// //      const rect = target.getBoundingClientRect();
// //      const tipW = 200;
// //      let left = rect.left + rect.width / 2 - tipW / 2;
// //      let top = rect.top - 36;

// //      // Keep within viewport
// //      if (left < 6) left = 6;
// //      if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// //      if (top < 6) top = rect.bottom + 6;

// //      tip.style.left = left + 'px';
// //      tip.style.top = top + 'px';
// //      tip.style.width = tipW + 'px';
// //    }


// // /* ═══════════════════════════════════════════════════════
// //    Research Assistant — side_panel.js
// //    Bugs fixed: delete, expand, content rendering
// //    New: export (PDF/DOC), tooltips, elegant UI
// //    ═══════════════════════════════════════════════════════ */

// //    'use strict';

// //    // ── State ──────────────────────────────────────────────
// //    let notes = [];
// //    let lastSummary = '';

// //    // ── Boot ───────────────────────────────────────────────
// //    document.addEventListener('DOMContentLoaded', () => {
// //      loadNotes();
// //      bindButtons();
// //      initTooltips();
// //    });

// //    // ── Button bindings ────────────────────────────────────
// //    function bindButtons() {
// //      document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// //      document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// //      document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// //      document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
// //      document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// //      document.getElementById('noteExportPdf').addEventListener('click', () => {
// //        exportSingleNote(window._activeNoteId, 'pdf');
// //      });
// //      document.getElementById('noteExportDoc').addEventListener('click', () => {
// //        exportSingleNote(window._activeNoteId, 'doc');
// //      });
// //      document.getElementById('noteExportModal').addEventListener('click', (e) => {
// //        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// //      });

// //      document.getElementById('exportBtn').addEventListener('click', openExportModal);
// //      document.getElementById('closeExport').addEventListener('click', closeExportModal);
// //      document.getElementById('exportPdf').addEventListener('click', () => exportNotes('pdf'));
// //      document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// //      // Close modal on backdrop click
// //      document.getElementById('exportModal').addEventListener('click', (e) => {
// //        if (e.target === document.getElementById('exportModal')) closeExportModal();
// //      });
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 1 — Summarise selected text on page
// //    // ══════════════════════════════════════════════════════
// //    async function summarizeSelection() {
// //      try {
// //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //        const [{ result: sel }] = await chrome.scripting.executeScript({
// //          target: { tabId: tab.id },
// //          function: () => window.getSelection().toString()
// //        });

// //        if (!sel || !sel.trim()) {
// //          showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// //          return;
// //        }

// //        showResult('Summarising…', false);
// //        hideSavePromptBar();

// //        const res = await fetch('http://localhost:8080/api/research/process', {
// //          method: 'POST',
// //          headers: { 'Content-Type': 'application/json' },
// //          body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
// //        });
// //        if (!res.ok) throw new Error('API error ' + res.status);

// //        lastSummary = (await res.text()).trim();
// //        showResult(lastSummary, true);       // true = plain text, not HTML
// //        showSavePromptBar();

// //      } catch (err) {
// //        showResult('❌ ' + err.message, false);
// //        hideSavePromptBar();
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 2 — Bookmark: auto-summarise selection or
// //    //             save page URL — no manual pasting needed
// //    // ══════════════════════════════════════════════════════
// //    async function bookmarkPage() {
// //      try {
// //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //        const [{ result: sel }] = await chrome.scripting.executeScript({
// //          target: { tabId: tab.id },
// //          function: () => window.getSelection().toString()
// //        });

// //        const content = (sel || '').trim();

// //        if (!content) {
// //          // No selection — save page as a plain bookmark
// //          const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// //          saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// //          toast('📌 Page bookmarked!');
// //          return;
// //        }

// //        toast('Summarising & saving…');
// //        const res = await fetch('http://localhost:8080/api/research/process', {
// //          method: 'POST',
// //          headers: { 'Content-Type': 'application/json' },
// //          body: JSON.stringify({ content, operation: 'summarize' })
// //        });
// //        if (!res.ok) throw new Error('API error ' + res.status);

// //        const summary = (await res.text()).trim();
// //        saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// //        toast('✅ Bookmarked & summarised!');

// //      } catch (err) {
// //        toast('❌ ' + err.message);
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 3 — Save the summary shown in result box
// //    // ══════════════════════════════════════════════════════
// //    function saveSummaryAsNote() {
// //      if (!lastSummary) return;
// //      saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// //      hideSavePromptBar();
// //      toast('✅ Summary saved to notes!');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 4 — Save manually typed note
// //    // ══════════════════════════════════════════════════════
// //    function saveManualNote() {
// //      const el = document.getElementById('quickNoteInput');
// //      const text = el.value.trim();
// //      if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// //      saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// //      el.value = '';
// //      toast('✅ Note saved!');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // CORE — Add note to state + storage + re-render
// //    // ══════════════════════════════════════════════════════
// //    function saveNote({ title, content, type }) {
// //      const note = {
// //        id: 'n' + Date.now(),          // safe prefix avoids pure-numeric ID edge cases
// //        title: title || 'Untitled',
// //        content: content || '',
// //        type: type || 'manual',
// //        pinned: false,
// //        expanded: false,
// //        createdAt: new Date().toISOString()
// //      };
// //      notes.unshift(note);
// //      persistNotes();
// //      renderNotes();
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 5 — Pin / unpin   (uses data-id, not inline onclick)
// //    // ══════════════════════════════════════════════════════
// //    function togglePin(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      note.pinned = !note.pinned;
// //      persistNotes();
// //      renderNotes();
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 6 — Delete   ← BUG FIX: was using bad filter
// //    // ══════════════════════════════════════════════════════
// //    function deleteNote(id) {
// //      const idx = notes.findIndex(n => n.id === id);
// //      if (idx === -1) return;
// //      notes.splice(idx, 1);
// //      persistNotes();
// //      renderNotes();
// //      toast('🗑 Note deleted');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 7 — Expand / collapse note content
// //    //   ← BUG FIX: toggling .open class on the .note-expand
// //    //     element directly found by id, no innerHTML re-render
// //    // ══════════════════════════════════════════════════════
// //    function toggleExpand(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      note.expanded = !note.expanded;
// //      // Directly show/hide the expand div — no re-render needed
// //      const expandEl = document.getElementById('exp-' + id);
// //      if (expandEl) expandEl.classList.toggle('open', note.expanded);

// //      // Rotate the chevron icon on the title button
// //      const titleBtn = document.getElementById('tbtn-' + id);
// //      if (titleBtn) {
// //        const chev = titleBtn.querySelector('.chev');
// //        if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// //      }
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 8 — Export notes (PDF or DOC/TXT)
// //    // ══════════════════════════════════════════════════════
// //    function openExportModal() {
// //      if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// //      document.getElementById('exportModal').classList.remove('hidden');
// //    }
// //    function closeExportModal() {
// //      document.getElementById('exportModal').classList.add('hidden');
// //    }

// //    function exportNotes(format) {
// //      closeExportModal();

// //      if (format === 'pdf') {
// //        exportAsPdf();
// //      } else {
// //        exportAsDoc();
// //      }
// //    }

// //    function exportAsPdf() {
// //      // Build a printable HTML page and open it in a new tab for the user to "Print → Save as PDF"
// //      const sorted = getSorted();
// //      let rows = sorted.map(n => {
// //        const date = formatDate(n.createdAt);
// //        const safeTitle = escHTML(n.title);
// //        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// //        const pinMark = n.pinned ? ' 📌' : '';
// //        return `
// //          <div class="note">
// //            <div class="note-head">
// //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// //              <span class="date">${date}</span>
// //            </div>
// //            <h2>${safeTitle}${pinMark}</h2>
// //            <p>${safeContent}</p>
// //          </div>`;
// //      }).join('');

// //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>Research Notes Export</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px;page-break-inside:avoid}
// //          .note-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
// //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .pin{font-size:10px;color:#e67700;font-weight:600}
// //          .date{font-size:10px;color:#aaa;margin-left:auto}
// //          @media print{body{padding:16px}.note{border:1px solid #ccc}}
// //        </style>
// //      </head><body>
// //        <h1>Research Notes</h1>
// //        <div class="meta">Exported ${new Date().toLocaleString()} · ${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
// //        ${rows}
// //      </body></html>`;

// //      downloadViaBlob(html, 'research-notes.html', 'text/html');
// //      toast('📄 research-notes.html saved — open it and Print → Save as PDF');
// //    }

// //    function exportAsDoc() {
// //      const sorted = getSorted();
// //      const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// //      sorted.forEach((n, i) => {
// //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// //        lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// //        lines.push(n.title);
// //        lines.push('');
// //        lines.push(n.content);
// //        lines.push('');
// //      });

// //      downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
// //      toast('📝 research-notes.txt saved to Downloads!');
// //    }

// //    // ══════════════════════════════════════════════════════
// //    // FEATURE 9 — Export a single note (PDF or DOC)
// //    // ══════════════════════════════════════════════════════
// //    function openNoteExportModal(id) {
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;
// //      window._activeNoteId = id;
// //      // Show note title in the modal so user knows which note they're exporting
// //      document.getElementById('noteExportTitle').textContent = note.title;
// //      document.getElementById('noteExportModal').classList.remove('hidden');
// //    }

// //    function closeNoteExportModal() {
// //      document.getElementById('noteExportModal').classList.add('hidden');
// //      window._activeNoteId = null;
// //    }

// //    function exportSingleNote(id, format) {
// //      closeNoteExportModal();
// //      const note = notes.find(n => n.id === id);
// //      if (!note) return;

// //      if (format === 'pdf') {
// //        exportSingleNoteAsPdf(note);
// //      } else {
// //        exportSingleNoteAsDoc(note);
// //      }
// //    }

// //    function exportSingleNoteAsPdf(note) {
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const safeTitle = escHTML(note.title);
// //      const safeContent = escHTML(note.content).replace(/\n/g, '<br>');
// //      const pinMark = note.pinned ? '<span class="pin">📌 Pinned</span>' : '';

// //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>${safeTitle}</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
// //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.4px}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .pin{font-size:11px;color:#e67700;font-weight:600}
// //          .date{font-size:11px;color:#8a90a8}
// //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// //          @media print{body{padding:20px}}
// //        </style>
// //      </head><body>
// //        <div class="meta">
// //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// //          ${pinMark}
// //          <span class="date">${date}</span>
// //        </div>
// //        <h1>${safeTitle}</h1>
// //        <p>${safeContent}</p>
// //      </body></html>`;

// //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// //      downloadViaBlob(html, `note-${slug}.html`, 'text/html');
// //      toast('📄 note saved as .html — open it and Print → Save as PDF');
// //    }

// //    function exportSingleNoteAsDoc(note) {
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const lines = [
// //        note.title,
// //        '='.repeat(Math.min(note.title.length, 60)),
// //        `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// //        `Date: ${date}`,
// //        '',
// //        note.content
// //      ];

// //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// //      downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
// //      toast('📝 note saved to Downloads!');
// //    }

// //    // ── Download helper ────────────────────────────────────
// //    // chrome.downloads.download() is the ONLY reliable way to save
// //    // files from a Chrome extension side panel to the user's system.
// //    // blob URL + chrome.tabs.create(), or anchor.click(), do NOT work
// //    // in extensions because blob URLs are scoped to the creating context.
// //    function downloadViaBlob(content, filename, mimeType) {
// //      // FileReader converts the Blob to a base64 data URL.
// //      // chrome.downloads.download() accepts data URLs and saves them
// //      // directly to the user's Downloads folder — no new tab needed.
// //      const blob = new Blob([content], { type: mimeType });
// //      const reader = new FileReader();
// //      reader.onloadend = () => {
// //        chrome.downloads.download({
// //          url: reader.result,   // e.g. "data:text/plain;base64,..."
// //          filename: filename,   // shown in Downloads bar & saved filename
// //          saveAs: false         // save directly; set true to show Save dialog
// //        }, (downloadId) => {
// //          if (chrome.runtime.lastError) {
// //            toast('❌ Download error: ' + chrome.runtime.lastError.message);
// //          }
// //        });
// //      };
// //      reader.readAsDataURL(blob);
// //    }

// //    function loadNotes() {
// //      chrome.storage.local.get(['researchNotesV2'], (result) => {
// //        notes = result.researchNotesV2 || [];
// //        renderNotes();
// //      });
// //    }
// //    function persistNotes() {
// //      chrome.storage.local.set({ researchNotesV2: notes });
// //    }

// //    // ── Render ─────────────────────────────────────────────
// //    function renderNotes() {
// //      const list = document.getElementById('notesList');
// //      const countEl = document.getElementById('noteCount');
// //      countEl.textContent = notes.length;

// //      if (!notes.length) {
// //        list.innerHTML = `
// //          <div class="empty-state">
// //            <span class="empty-icon">🗒️</span>
// //            <p>No notes yet.<br>Summarise text or bookmark a page to get started.</p>
// //          </div>`;
// //        return;
// //      }

// //      list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// //      // ── Attach events via JS (NOT inline onclick) ─────────
// //      // This is the correct fix: event delegation from the list
// //      list.querySelectorAll('.note-card').forEach(card => {
// //        const id = card.dataset.id;

// //        // Title / expand button
// //        const titleBtn = card.querySelector('.note-title-btn');
// //        if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));

// //        // Download (per-note export) button
// //        const dlBtn = card.querySelector('.dl-btn');
// //        if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));

// //        // Pin button
// //        const pinBtn = card.querySelector('.pin-btn');
// //        if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));

// //        // Delete button
// //        const delBtn = card.querySelector('.del-btn');
// //        if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// //      });
// //    }

// //    // ── Card HTML builder ──────────────────────────────────
// //    // NOTE: content is stored and displayed as PLAIN TEXT.
// //    // escHTML() is used for the preview/title only.
// //    // The expand area uses textContent via CSS white-space:pre-wrap
// //    // so no escaping needed and <br> injection bug is gone.
// //    function buildCardHTML(note) {
// //      const safeTitle = escHTML(note.title);
// //      const safePreview = escHTML(truncate(note.content, 120));
// //      // For the expand area we store the raw content and set
// //      // it via textContent after insertion (see renderNotes event binding below)
// //      const date = formatDate(note.createdAt);
// //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// //      const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// //      const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// //      const expandOpen = note.expanded ? 'open' : '';
// //      const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// //      return `
// //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// //          <div class="note-card-top">
// //            <button class="note-title-btn" id="tbtn-${note.id}"
// //              aria-expanded="${note.expanded}"
// //              aria-label="Toggle note: ${safeTitle}"
// //              data-tooltip="Click to read the full note">
// //              <span class="note-title-text">${safeTitle}</span>
// //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// //            </button>
// //            <div class="card-actions">
// //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// //              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
// //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
// //              </button>
// //              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
// //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
// //              </button>
// //            </div>
// //          </div>
// //          <div class="note-preview">${safePreview}</div>
// //          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
// //          <div class="note-footer">
// //            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
// //            <span class="note-date">${date}</span>
// //            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
// //          </div>
// //        </div>`;
// //    }

// //    // ── After render: inject full content as textContent ───
// //    // This completely avoids the <br> / HTML injection bug.
// //    // We override renderNotes to do a second pass:
// //    const _renderNotes = renderNotes;
// //    // Re-assign with post-pass
// //    (function patchRender() {
// //      const original = window.renderNotes || renderNotes;
// //      // After innerHTML is set, fill expand divs with plain text
// //      const observer = new MutationObserver(() => {
// //        document.querySelectorAll('.note-expand').forEach(el => {
// //          const card = el.closest('.note-card');
// //          if (!card) return;
// //          const id = card.dataset.id;
// //          if (!id || el._filled) return;
// //          const note = notes.find(n => n.id === id);
// //          if (!note) return;
// //          el.textContent = note.content;   // plain text, no escaping needed
// //          el._filled = true;
// //        });
// //      });
// //      observer.observe(document.getElementById('notesList'), { childList: true, subtree: false });
// //    })();

// //    // ── Helpers ────────────────────────────────────────────
// //    function getSorted() {
// //      return [
// //        ...notes.filter(n => n.pinned),
// //        ...notes.filter(n => !n.pinned)
// //      ];
// //    }

// //    function autoTitle(text) {
// //      const clean = text.replace(/\n/g, ' ').trim();
// //      const words = clean.split(/\s+/).slice(0, 7).join(' ');
// //      return clean.split(/\s+/).length > 7 ? words + '…' : words;
// //    }

// //    function truncate(text, maxLen) {
// //      const flat = text.replace(/\n/g, ' ');
// //      return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// //    }

// //    function escHTML(str) {
// //      return String(str)
// //        .replace(/&/g, '&amp;')
// //        .replace(/</g, '&lt;')
// //        .replace(/>/g, '&gt;')
// //        .replace(/"/g, '&quot;');
// //    }

// //    function formatDate(iso) {
// //      const d = new Date(iso);
// //      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
// //        + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// //    }

// //    // ── Result box helpers ──────────────────────────────────
// //    function showResult(text, isPlain) {
// //      const box = document.getElementById('resultBox');
// //      const content = document.getElementById('resultContent');
// //      if (isPlain) {
// //        content.textContent = text;   // plain text — safe, no XSS
// //      } else {
// //        content.innerHTML = text;     // only used for internal status messages
// //      }
// //      box.classList.remove('hidden');
// //    }

// //    function showSavePromptBar() {
// //      document.getElementById('savePromptBar').classList.remove('hidden');
// //    }
// //    function hideSavePromptBar() {
// //      document.getElementById('savePromptBar').classList.add('hidden');
// //      lastSummary = '';
// //    }

// //    // ── Toast ──────────────────────────────────────────────
// //    function toast(msg) {
// //      const el = document.getElementById('toast');
// //      el.textContent = msg;
// //      el.classList.add('show');
// //      clearTimeout(el._tid);
// //      el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// //    }

// //    // ── Tooltip system ─────────────────────────────────────
// //    function initTooltips() {
// //      const tip = document.getElementById('tooltip');
// //      let hoverEl = null;
// //      let showTid = null;

// //      document.addEventListener('mouseover', (e) => {
// //        const target = e.target.closest('[data-tooltip]');
// //        if (!target) return;
// //        hoverEl = target;
// //        clearTimeout(showTid);
// //        showTid = setTimeout(() => {
// //          const msg = target.dataset.tooltip;
// //          if (!msg) return;
// //          tip.textContent = msg;
// //          positionTooltip(tip, target);
// //          tip.classList.add('visible');
// //          tip.removeAttribute('aria-hidden');
// //        }, 500);
// //      });

// //      document.addEventListener('mouseout', (e) => {
// //        if (!e.target.closest('[data-tooltip]')) return;
// //        clearTimeout(showTid);
// //        tip.classList.remove('visible');
// //        tip.setAttribute('aria-hidden', 'true');
// //        hoverEl = null;
// //      });
// //    }

// //    function positionTooltip(tip, target) {
// //      const rect = target.getBoundingClientRect();
// //      const tipW = 200;
// //      let left = rect.left + rect.width / 2 - tipW / 2;
// //      let top = rect.top - 36;

// //      // Keep within viewport
// //      if (left < 6) left = 6;
// //      if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// //      if (top < 6) top = rect.bottom + 6;

// //      tip.style.left = left + 'px';
// //      tip.style.top = top + 'px';
// //      tip.style.width = tipW + 'px';
// //    }

// /* ═══════════════════════════════════════════════════════
//    Research Assistant — side_panel.js (FIXED DOWNLOAD)
//    Now uses background service worker for reliable downloads
//    ═══════════════════════════════════════════════════════ */

// 'use strict';

// let notes = [];
// let lastSummary = '';

// document.addEventListener('DOMContentLoaded', () => {
//     loadNotes();
//     bindButtons();
//     initTooltips();
// });

// function bindButtons() {
//     document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
//     document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
//     document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
//     document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
//     document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
//     document.getElementById('noteExportHTML').addEventListener('click', () => {
//         exportSingleNote(window._activeNoteId, 'html');
//     });
//     document.getElementById('noteExportDoc').addEventListener('click', () => {
//         exportSingleNote(window._activeNoteId, 'doc');
//     });
//     document.getElementById('noteExportModal').addEventListener('click', (e) => {
//         if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
//     });

//     document.getElementById('exportBtn').addEventListener('click', openExportModal);
//     document.getElementById('closeExport').addEventListener('click', closeExportModal);
//     document.getElementById('exportHTML').addEventListener('click', () => exportNotes('pdf'));
//     document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

//     document.getElementById('exportModal').addEventListener('click', (e) => {
//         if (e.target === document.getElementById('exportModal')) closeExportModal();
//     });
// }

// // ═══════════════════════════════════════════════════
// // FEATURE 1 — Summarise selected text
// // ═══════════════════════════════════════════════════
// async function summarizeSelection() {
//     try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         const [{ result: sel }] = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => window.getSelection().toString()
//         });

//         if (!sel || !sel.trim()) {
//             showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
//             return;
//         }

//         showResult('Summarising…', false);
//         hideSavePromptBar();

//         const res = await fetch('http://localhost:8080/api/research/process', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
//         });
//         if (!res.ok) throw new Error('API error ' + res.status);

//         lastSummary = (await res.text()).trim();
//         showResult(lastSummary, true);
//         showSavePromptBar();

//     } catch (err) {
//         showResult('❌ ' + err.message, false);
//         hideSavePromptBar();
//     }
// }

// // ═══════════════════════════════════════════════════
// // FEATURE 2 — Bookmark page or selection
// // ═══════════════════════════════════════════════════
// async function bookmarkPage() {
//     try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         const [{ result: sel }] = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => window.getSelection().toString()
//         });

//         const content = (sel || '').trim();

//         if (!content) {
//             const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
//             saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
//             toast('📌 Page bookmarked!');
//             return;
//         }

//         toast('Summarising & saving…');
//         const res = await fetch('http://localhost:8080/api/research/process', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ content, operation: 'summarize' })
//         });
//         if (!res.ok) throw new Error('API error ' + res.status);

//         const summary = (await res.text()).trim();
//         saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
//         toast('✅ Bookmarked & summarised!');

//     } catch (err) {
//         toast('❌ ' + err.message);
//     }
// }

// function saveSummaryAsNote() {
//     if (!lastSummary) return;
//     saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
//     hideSavePromptBar();
//     toast('✅ Summary saved to notes!');
// }

// function saveManualNote() {
//     const el = document.getElementById('quickNoteInput');
//     const text = el.value.trim();
//     if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
//     saveNote({ title: autoTitle(text), content: text, type: 'manual' });
//     el.value = '';
//     toast('✅ Note saved!');
// }

// function saveNote({ title, content, type }) {
//     const note = {
//         id: 'n' + Date.now(),
//         title: title || 'Untitled',
//         content: content || '',
//         type: type || 'manual',
//         pinned: false,
//         expanded: false,
//         createdAt: new Date().toISOString()
//     };
//     notes.unshift(note);
//     persistNotes();
//     renderNotes();
// }

// function togglePin(id) {
//     const note = notes.find(n => n.id === id);
//     if (!note) return;
//     note.pinned = !note.pinned;
//     persistNotes();
//     renderNotes();
// }

// function editNoteTitle(id) {

//     // Find note
//     const note = notes.find(n => n.id === id);

//     if (!note) return;

//     // Ask user for new title
//     const newTitle = prompt(
//         'Enter new note title:',
//         note.title
//     );

//     // User pressed cancel
//     if (newTitle === null) return;

//     // Remove extra spaces
//     const cleanTitle = newTitle.trim();

//     // Prevent empty title
//     if (!cleanTitle) {
//         toast('⚠️ Title cannot be empty');
//         return;
//     }

//     // Update title
//     note.title = cleanTitle;

//     // Save to Chrome storage
//     persistNotes();

//     // Refresh UI
//     renderNotes();

//     toast('✅ Title updated!');
// }

// function deleteNote(id) {
//     const idx = notes.findIndex(n => n.id === id);
//     if (idx === -1) return;
//     notes.splice(idx, 1);
//     persistNotes();
//     renderNotes();
//     toast('🗑 Note deleted');
// }

// function toggleExpand(id) {
//     const note = notes.find(n => n.id === id);
//     if (!note) return;
//     note.expanded = !note.expanded;
//     const expandEl = document.getElementById('exp-' + id);
//     if (expandEl) expandEl.classList.toggle('open', note.expanded);

//     const titleBtn = document.getElementById('tbtn-' + id);
//     if (titleBtn) {
//         const chev = titleBtn.querySelector('.chev');
//         if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
//     }
// }

// // ═══════════════════════════════════════════════════
// // EXPORT FUNCTIONS
// // ═══════════════════════════════════════════════════
// function openExportModal() {
//     if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
//     document.getElementById('exportModal').classList.remove('hidden');
// }

// function closeExportModal() {
//     document.getElementById('exportModal').classList.add('hidden');
// }

// function exportNotes(format) {
//     closeExportModal();
//     if (format === 'html') {
//         exportAsHTML();
//     } else if (format === 'txt') {
//         exportAsDoc();
//     }
// }

// function exportAsHTML() {
//     const sorted = getSorted();
//     let rows = sorted.map(n => {
//         const date = formatDate(n.createdAt);
//         const safeTitle = escHTML(n.title);
//         const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
//         const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
//         return `
//          <div class="note">
//            <div class="note-head">
//              <span class="badge badge-${n.type}">${badgeLabel}</span>
//              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
//              <span class="date">${date}</span>
//            </div>
//            <h2>${safeTitle}</h2>
//            <p>${safeContent}</p>
//          </div>`;
//     }).join('');

//     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
//        <title>Research Notes Export</title>
//        <style>
//          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
//          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
//          .meta{font-size:12px;color:#888;margin-bottom:28px}
//          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px}
//          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
//          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
//          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase}
//          .badge-summary{background:#eef1ff;color:#2f4ac5}
//          .badge-bookmark{background:#f3f0ff;color:#7048e8}
//          .badge-manual{background:#ebfbee;color:#2f9e44}
//          .date{font-size:10px;color:#aaa;margin-left:auto}
//        </style>
//      </head><body>
//        <h1>Research Notes</h1>
//        <div class="meta">Exported ${new Date().toLocaleString()}</div>
//        ${rows}
//      </body></html>`;

//     downloadViaBlob(html, 'research-notes.html', 'text/html');
//     toast('📄 Downloading research-notes.html...');
// }

// function exportAsDoc() {
//     const sorted = getSorted();
//     const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
//     sorted.forEach((n, i) => {
//         const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
//         lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
//         lines.push(n.title);
//         lines.push('');
//         lines.push(n.content);
//         lines.push('');
//     });

//     downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
//     toast('📝 Downloading research-notes.txt...');
// }

// function openNoteExportModal(id) {
//     const note = notes.find(n => n.id === id);
//     if (!note) return;
//     window._activeNoteId = id;
//     document.getElementById('noteExportTitle').textContent = note.title;
//     document.getElementById('noteExportModal').classList.remove('hidden');
// }

// function closeNoteExportModal() {
//     document.getElementById('noteExportModal').classList.add('hidden');
//     window._activeNoteId = null;
// }

// function exportSingleNote(id, format) {
//     closeNoteExportModal();
//     const note = notes.find(n => n.id === id);
//     if (!note) return;

//     if (format === 'html') {
//         exportSingleNoteAsHTML(note);
//     } else {
//         exportSingleNoteAsDoc(note);
//     }
// }

// function exportSingleNoteAsHTML(note) {
//     const date = formatDate(note.createdAt);
//     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
//     const safeTitle = escHTML(note.title);
//     const safeContent = escHTML(note.content).replace(/\n/g, '<br>');

//     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
//        <title>${safeTitle}</title>
//        <style>
//          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
//          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px}
//          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase}
//          .badge-summary{background:#eef1ff;color:#2f4ac5}
//          .badge-bookmark{background:#f3f0ff;color:#7048e8}
//          .badge-manual{background:#ebfbee;color:#2f9e44}
//          .date{font-size:11px;color:#8a90a8}
//          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
//          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
//        </style>
//      </head><body>
//        <div class="meta">
//          <span class="badge badge-${note.type}">${badgeLabel}</span>
//          <span class="date">${date}</span>
//        </div>
//        <h1>${safeTitle}</h1>
//        <p>${safeContent}</p>
//      </body></html>`;

//     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
//     downloadViaBlob(html, `note-${slug}.html`, 'text/html');
//     toast('📄 Downloading note...');
// }

// function exportSingleNoteAsDoc(note) {
//     const date = formatDate(note.createdAt);
//     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
//     const lines = [
//         note.title,
//         '='.repeat(Math.min(note.title.length, 60)),
//         `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
//         `Date: ${date}`,
//         '',
//         note.content
//     ];

//     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
//     downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
//     toast('📝 Downloading note...');
// }

// // ═══════════════════════════════════════════════════
// // FIXED DOWNLOAD FUNCTION
// // Uses background service worker for reliability
// // ═══════════════════════════════════════════════════
// function downloadViaBlob(content, filename, mimeType) {
//     // Send to background service worker which handles the download
//     chrome.runtime.sendMessage({
//         action: 'downloadFile',
//         content: content,
//         filename: filename,
//         mimeType: mimeType
//     }, (response) => {
//         if (chrome.runtime.lastError) {
//             console.error('Download error:', chrome.runtime.lastError.message);
//             toast('❌ Download error: ' + chrome.runtime.lastError.message);
//         }
//     });
// }

// // ═══════════════════════════════════════════════════
// // STORAGE & RENDERING
// // ═══════════════════════════════════════════════════
// function loadNotes() {
//     chrome.storage.local.get(['researchNotesV2'], (result) => {
//         notes = result.researchNotesV2 || [];
//         renderNotes();
//     });
// }

// function persistNotes() {
//     chrome.storage.local.set({ researchNotesV2: notes });
// }

// function renderNotes() {
//     const list = document.getElementById('notesList');
//     const countEl = document.getElementById('noteCount');
//     countEl.textContent = notes.length;

//     if (!notes.length) {
//         list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
//         return;
//     }

//     list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

//     list.querySelectorAll('.note-card').forEach(card => {
//         const id = card.dataset.id;
//         const titleBtn = card.querySelector('.note-title-btn');
//         if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));
//         const dlBtn = card.querySelector('.dl-btn');
//         if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));
//         const pinBtn = card.querySelector('.pin-btn');
//         if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));
//         const editBtn = card.querySelector('.edit-btn');
//         if (editBtn) {
//             editBtn.addEventListener('click', () => editNoteTitle(id));
//         }
//         const delBtn = card.querySelector('.del-btn');
//         if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
//     });
// }

// function buildCardHTML(note) {
//     const safeTitle = escHTML(note.title);
//     const safePreview = escHTML(truncate(note.content, 120));
//     const date = formatDate(note.createdAt);
//     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
//     const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
//     const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
//     const expandOpen = note.expanded ? 'open' : '';
//     const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

//     return `
//        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
//          <div class="note-card-top">
//            <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" aria-label="Toggle note: ${safeTitle}" data-tooltip="Click to read the full note">
//              <span class="note-title-text">${safeTitle}</span>
//              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
//            </button>
//            <div class="card-actions">
//              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
//              <button class="card-icon-btn edit-btn" data-tooltip="Edit note title" aria-label="Edit note title" title="Edit title">✏️</button>
//              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
//                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//              </button>
//              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
//                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
//              </button>
//            </div>
//          </div>
//          <div class="note-preview">${safePreview}</div>
//          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
//          <div class="note-footer">
//            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
//            <span class="note-date">${date}</span>
//            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
//          </div>
//        </div>`;
// }

// (function patchRender() {
//     const observer = new MutationObserver(() => {
//         document.querySelectorAll('.note-expand').forEach(el => {
//             const card = el.closest('.note-card');
//             if (!card) return;
//             const id = card.dataset.id;
//             if (!id || el._filled) return;
//             const note = notes.find(n => n.id === id);
//             if (!note) return;
//             el.textContent = note.content;
//             el._filled = true;
//         });
//     });
//     const list = document.getElementById('notesList');
//     if (list) observer.observe(list, { childList: true, subtree: false });
// })();

// // ═══════════════════════════════════════════════════
// // HELPERS
// // ═══════════════════════════════════════════════════
// function getSorted() {
//     return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
// }

// function autoTitle(text) {
//     const clean = text.replace(/\n/g, ' ').trim();
//     const words = clean.split(/\s+/).slice(0, 7).join(' ');
//     return clean.split(/\s+/).length > 7 ? words + '…' : words;
// }

// function truncate(text, maxLen) {
//     const flat = text.replace(/\n/g, ' ');
//     return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// }

// function escHTML(str) {
//     return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// }

// function formatDate(iso) {
//     const d = new Date(iso);
//     return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// }

// function showResult(text, isPlain) {
//     const box = document.getElementById('resultBox');
//     const content = document.getElementById('resultContent');
//     if (isPlain) {
//         content.textContent = text;
//     } else {
//         content.innerHTML = text;
//     }
//     box.classList.remove('hidden');
// }

// function showSavePromptBar() {
//     document.getElementById('savePromptBar').classList.remove('hidden');
// }

// function hideSavePromptBar() {
//     document.getElementById('savePromptBar').classList.add('hidden');
//     lastSummary = '';
// }

// function toast(msg) {
//     const el = document.getElementById('toast');
//     el.textContent = msg;
//     el.classList.add('show');
//     clearTimeout(el._tid);
//     el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// }

// function initTooltips() {
//     const tip = document.getElementById('tooltip');
//     let showTid = null;

//     document.addEventListener('mouseover', (e) => {
//         const target = e.target.closest('[data-tooltip]');
//         if (!target) return;
//         clearTimeout(showTid);
//         showTid = setTimeout(() => {
//             const msg = target.dataset.tooltip;
//             if (!msg) return;
//             tip.textContent = msg;
//             positionTooltip(tip, target);
//             tip.classList.add('visible');
//             tip.removeAttribute('aria-hidden');
//         }, 500);
//     });

//     document.addEventListener('mouseout', (e) => {
//         if (!e.target.closest('[data-tooltip]')) return;
//         clearTimeout(showTid);
//         tip.classList.remove('visible');
//         tip.setAttribute('aria-hidden', 'true');
//     });
// }

// function positionTooltip(tip, target) {
//     const rect = target.getBoundingClientRect();
//     const tipW = 200;
//     let left = rect.left + rect.width / 2 - tipW / 2;
//     let top = rect.top - 36;

//     if (left < 6) left = 6;
//     if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
//     if (top < 6) top = rect.bottom + 6;

//     tip.style.left = left + 'px';
//     tip.style.top = top + 'px';
//     tip.style.width = tipW + 'px';
// }

'use strict';

let notes = [];
let lastSummary = '';

// ═══════════════════════════════════════════════════════════════════
// NEW: CONVERSATION STATE MANAGEMENT
// WHY? Track the entire conversation so AI can remember context
// ═══════════════════════════════════════════════════════════════════
let currentConversation = {
    originalSelectedText: '',      // Original text user selected
    currentSummary: '',             // Latest summary from AI
    messages: [],                   // All Q&A history
    isActive: false                 // Is conversation happening?
};

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    bindButtons();
    initTooltips();
    initChatInterface();  // NEW: Initialize chat features
});

function bindButtons() {
    document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
    document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
    document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
    document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
    
    // NEW: Chat-related buttons
    document.getElementById('chatSendBtn').addEventListener('click', sendFollowUpQuestion);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendFollowUpQuestion();
        }
    });
    document.getElementById('saveConversationBtn').addEventListener('click', saveConversationAsNote);
    
    document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
    document.getElementById('noteExportHTML').addEventListener('click', () => {
        exportSingleNote(window._activeNoteId, 'html');
    });
    document.getElementById('noteExportDoc').addEventListener('click', () => {
        exportSingleNote(window._activeNoteId, 'doc');
    });
    document.getElementById('noteExportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
    });

    document.getElementById('exportBtn').addEventListener('click', openExportModal);
    document.getElementById('closeExport').addEventListener('click', closeExportModal);
    document.getElementById('exportHTML').addEventListener('click', () => exportNotes('pdf'));
    document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

    document.getElementById('exportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('exportModal')) closeExportModal();
    });
}

// ═══════════════════════════════════════════════════════════════════
// NEW: Initialize Chat Interface
// WHY? Setup chat box and make it ready for questions
// ═══════════════════════════════════════════════════════════════════
function initChatInterface() {
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    
    // Hide chat box initially (show only after summary)
    // WHY? No point showing chat if there's no summary to ask about
    chatBox.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════════════
// FEATURE 1 — Summarise selected text WITH WORD COUNT SUPPORT
// ═══════════════════════════════════════════════════════════════════
async function summarizeSelection() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result: sel }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!sel || !sel.trim()) {
            showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
            hideChat();
            return;
        }

        showResult('Summarising…', false);
        hideSavePromptBar();
        hideChat();

        // NEW: Store original text for conversation context
        currentConversation.originalSelectedText = sel.trim();
        currentConversation.messages = [];  // Reset conversation
        currentConversation.isActive = false;

        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: sel.trim(), 
                operation: 'summarize'
                // WHY? Backend will automatically extract word count from content
                // Example: "Summarize in 50 words" → backend extracts 50
            })
        });
        if (!res.ok) throw new Error('API error ' + res.status);

        lastSummary = (await res.text()).trim();
        
        // NEW: Store summary in conversation state
        currentConversation.currentSummary = lastSummary;
        currentConversation.isActive = true;
        
        showResult(lastSummary, true);
        showSavePromptBar();
        
        // NEW: Show chat interface for follow-up questions
        showChat();
        toast('✅ Summary ready! Ask follow-up questions below.');

    } catch (err) {
        showResult('❌ ' + err.message, false);
        hideSavePromptBar();
        hideChat();
    }
}

// ═══════════════════════════════════════════════════════════════════
// FEATURE 2 — Bookmark page or selection
// ═══════════════════════════════════════════════════════════════════
async function bookmarkPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result: sel }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        const content = (sel || '').trim();

        if (!content) {
            const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
            saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
            toast('📌 Page bookmarked!');
            return;
        }

        toast('Summarising & saving…');
        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, operation: 'summarize' })
        });
        if (!res.ok) throw new Error('API error ' + res.status);

        const summary = (await res.text()).trim();
        saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
        toast('✅ Bookmarked & summarised!');

    } catch (err) {
        toast('❌ ' + err.message);
    }
}

function saveSummaryAsNote() {
    if (!lastSummary) return;
    saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
    hideSavePromptBar();
    toast('✅ Summary saved to notes!');
}

function saveManualNote() {
    const el = document.getElementById('quickNoteInput');
    const text = el.value.trim();
    if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
    saveNote({ title: autoTitle(text), content: text, type: 'manual' });
    el.value = '';
    toast('✅ Note saved!');
}

// ═══════════════════════════════════════════════════════════════════
// NEW: Handle Follow-Up Questions
// WHY? Allow user to ask questions about the summary
// Similar to ChatGPT, Claude, Gemini
// ═══════════════════════════════════════════════════════════════════
async function sendFollowUpQuestion() {
    const chatInput = document.getElementById('chatInput');
    const question = chatInput.value.trim();
    
    if (!question) {
        toast('⚠️ Type a question first!');
        return;
    }
    
    if (!currentConversation.isActive) {
        toast('⚠️ Get a summary first before asking questions!');
        return;
    }
    
    // Add user's question to chat display
    addMessageToChat('user', question);
    
    // Add to conversation history for context
    currentConversation.messages.push({
        role: 'user',
        content: question
    });
    
    // Clear input
    chatInput.value = '';
    
    // Show loading indicator
    addMessageToChat('assistant', '⏳ Thinking...');
    
    try {
        // Send to backend
        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'followup',
                question: question,
                content: currentConversation.currentSummary,  // Latest summary
                originalSelectedText: currentConversation.originalSelectedText,  // Original text for context
                conversationHistory: currentConversation.messages.slice(0, -1)  // Previous messages (exclude current question)
            })
        });
        
        if (!res.ok) throw new Error('API error ' + res.status);
        
        const answer = (await res.text()).trim();
        
        // Remove "thinking" message and add real answer
        removeLastMessage();
        addMessageToChat('assistant', answer);
        
        // Add to conversation history
        currentConversation.messages.push({
            role: 'assistant',
            content: answer
        });
        
        // Auto-scroll to latest message
        scrollChatToBottom();
        
    } catch (err) {
        removeLastMessage();
        addMessageToChat('assistant', '❌ Error: ' + err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════
// NEW: Save Entire Conversation as Note
// WHY? User might want to keep the whole Q&A session
// ═══════════════════════════════════════════════════════════════════
function saveConversationAsNote() {
    if (currentConversation.messages.length === 0) {
        toast('⚠️ No conversation to save!');
        return;
    }
    
    // Build conversation text
    let conversationText = 'ORIGINAL TEXT:\n';
    conversationText += currentConversation.originalSelectedText + '\n\n';
    conversationText += 'SUMMARY:\n';
    conversationText += currentConversation.currentSummary + '\n\n';
    conversationText += 'CONVERSATION:\n';
    conversationText += '─'.repeat(50) + '\n';
    
    currentConversation.messages.forEach((msg, idx) => {
        if (msg.role === 'user') {
            conversationText += `\n[Question ${idx + 1}]\n`;
            conversationText += msg.content + '\n';
        } else {
            conversationText += `\n[Answer]\n`;
            conversationText += msg.content + '\n';
        }
    });
    
    // Create a note
    saveNote({
        title: autoTitle(currentConversation.currentSummary) + ' (with Q&A)',
        content: conversationText,
        type: 'conversation'  // NEW: Special type for conversations
    });
    
    toast('✅ Conversation saved as note!');
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS: Chat UI Management
// ═══════════════════════════════════════════════════════════════════

function showChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.classList.remove('hidden');
    document.getElementById('saveConversationBtn').classList.remove('hidden');
}

function hideChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.classList.add('hidden');
    document.getElementById('saveConversationBtn').classList.add('hidden');
}

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    
    const badgeEl = document.createElement('span');
    badgeEl.className = `chat-badge badge-${role}`;
    badgeEl.textContent = role === 'user' ? 'You' : 'Assistant';
    
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'chat-bubble';
    bubbleEl.textContent = content;
    
    messageEl.appendChild(badgeEl);
    messageEl.appendChild(bubbleEl);
    
    chatMessages.appendChild(messageEl);
}

function removeLastMessage() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages.lastChild) {
        chatMessages.removeChild(chatMessages.lastChild);
    }
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    // WHY? Auto-scroll so user sees latest message
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function saveNote({ title, content, type }) {
    const note = {
        id: 'n' + Date.now(),
        title: title || 'Untitled',
        content: content || '',
        type: type || 'manual',
        pinned: false,
        expanded: false,
        createdAt: new Date().toISOString()
    };
    notes.unshift(note);
    persistNotes();
    renderNotes();
}

function togglePin(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.pinned = !note.pinned;
    persistNotes();
    renderNotes();
}

function editNoteTitle(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const newTitle = prompt('Enter new note title:', note.title);
    if (newTitle === null) return;

    const cleanTitle = newTitle.trim();
    if (!cleanTitle) {
        toast('⚠️ Title cannot be empty');
        return;
    }

    note.title = cleanTitle;
    persistNotes();
    renderNotes();
    toast('✅ Title updated!');
}

function deleteNote(id) {
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;
    notes.splice(idx, 1);
    persistNotes();
    renderNotes();
    toast('🗑 Note deleted');
}

function toggleExpand(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.expanded = !note.expanded;
    const expandEl = document.getElementById('exp-' + id);
    if (expandEl) expandEl.classList.toggle('open', note.expanded);

    const titleBtn = document.getElementById('tbtn-' + id);
    if (titleBtn) {
        const chev = titleBtn.querySelector('.chev');
        if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
function openExportModal() {
    if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
    document.getElementById('exportModal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
}

function exportNotes(format) {
    closeExportModal();
    if (format === 'html') {
        exportAsHTML();
    } else if (format === 'txt') {
        exportAsDoc();
    }
}

function exportAsHTML() {
    const sorted = getSorted();
    let rows = sorted.map(n => {
        const date = formatDate(n.createdAt);
        const safeTitle = escHTML(n.title);
        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
        const badgeLabel = { 
            summary: 'Summary', 
            bookmark: 'Bookmark', 
            manual: 'Note',
            conversation: 'Conversation'  // NEW
        }[n.type] || 'Note';
        return `
         <div class="note">
           <div class="note-head">
             <span class="badge badge-${n.type}">${badgeLabel}</span>
             ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
             <span class="date">${date}</span>
           </div>
           <h2>${safeTitle}</h2>
           <p>${safeContent}</p>
         </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
       <title>Research Notes Export</title>
       <style>
         body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
         h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
         .meta{font-size:12px;color:#888;margin-bottom:28px}
         .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px}
         h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
         p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
         .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase}
         .badge-summary{background:#eef1ff;color:#2f4ac5}
         .badge-bookmark{background:#f3f0ff;color:#7048e8}
         .badge-manual{background:#ebfbee;color:#2f9e44}
         .badge-conversation{background:#ffeedd;color:#d97706}
         .date{font-size:10px;color:#aaa;margin-left:auto}
       </style>
     </head><body>
       <h1>Research Notes</h1>
       <div class="meta">Exported ${new Date().toLocaleString()}</div>
       ${rows}
     </body></html>`;

    downloadViaBlob(html, 'research-notes.html', 'text/html');
    toast('📄 Downloading research-notes.html...');
}

function exportAsDoc() {
    const sorted = getSorted();
    const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
    sorted.forEach((n, i) => {
        const badgeLabel = { 
            summary: 'Summary', 
            bookmark: 'Bookmark', 
            manual: 'Note',
            conversation: 'Conversation'  // NEW
        }[n.type] || 'Note';
        lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
        lines.push(n.title);
        lines.push('');
        lines.push(n.content);
        lines.push('');
    });

    downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
    toast('📝 Downloading research-notes.txt...');
}

function openNoteExportModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    window._activeNoteId = id;
    document.getElementById('noteExportTitle').textContent = note.title;
    document.getElementById('noteExportModal').classList.remove('hidden');
}

function closeNoteExportModal() {
    document.getElementById('noteExportModal').classList.add('hidden');
    window._activeNoteId = null;
}

function exportSingleNote(id, format) {
    closeNoteExportModal();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (format === 'html') {
        exportSingleNoteAsHTML(note);
    } else {
        exportSingleNoteAsDoc(note);
    }
}

function exportSingleNoteAsHTML(note) {
    const date = formatDate(note.createdAt);
    const badgeLabel = { 
        summary: 'Summary', 
        bookmark: 'Bookmark', 
        manual: 'Note',
        conversation: 'Conversation'  // NEW
    }[note.type] || 'Note';
    const safeTitle = escHTML(note.title);
    const safeContent = escHTML(note.content).replace(/\n/g, '<br>');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
       <title>${safeTitle}</title>
       <style>
         body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
         .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px}
         .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase}
         .badge-summary{background:#eef1ff;color:#2f4ac5}
         .badge-bookmark{background:#f3f0ff;color:#7048e8}
         .badge-manual{background:#ebfbee;color:#2f9e44}
         .badge-conversation{background:#ffeedd;color:#d97706}
         .date{font-size:11px;color:#8a90a8}
         h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
         p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
       </style>
     </head><body>
       <div class="meta">
         <span class="badge badge-${note.type}">${badgeLabel}</span>
         <span class="date">${date}</span>
       </div>
       <h1>${safeTitle}</h1>
       <p>${safeContent}</p>
     </body></html>`;

    const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadViaBlob(html, `note-${slug}.html`, 'text/html');
    toast('📄 Downloading note...');
}

function exportSingleNoteAsDoc(note) {
    const date = formatDate(note.createdAt);
    const badgeLabel = { 
        summary: 'Summary', 
        bookmark: 'Bookmark', 
        manual: 'Note',
        conversation: 'Conversation'  // NEW
    }[note.type] || 'Note';
    const lines = [
        note.title,
        '='.repeat(Math.min(note.title.length, 60)),
        `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
        `Date: ${date}`,
        '',
        note.content
    ];

    const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
    toast('📝 Downloading note...');
}

function downloadViaBlob(content, filename, mimeType) {
    chrome.runtime.sendMessage({
        action: 'downloadFile',
        content: content,
        filename: filename,
        mimeType: mimeType
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError.message);
            toast('❌ Download error: ' + chrome.runtime.lastError.message);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE & RENDERING
// ═══════════════════════════════════════════════════════════════════
function loadNotes() {
    chrome.storage.local.get(['researchNotesV2'], (result) => {
        notes = result.researchNotesV2 || [];
        renderNotes();
    });
}

function persistNotes() {
    chrome.storage.local.set({ researchNotesV2: notes });
}

function renderNotes() {
    const list = document.getElementById('notesList');
    const countEl = document.getElementById('noteCount');
    countEl.textContent = notes.length;

    if (!notes.length) {
        list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
        return;
    }

    list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

    list.querySelectorAll('.note-card').forEach(card => {
        const id = card.dataset.id;
        const titleBtn = card.querySelector('.note-title-btn');
        if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));
        const dlBtn = card.querySelector('.dl-btn');
        if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));
        const pinBtn = card.querySelector('.pin-btn');
        if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => editNoteTitle(id));
        }
        const delBtn = card.querySelector('.del-btn');
        if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
    });
}

function buildCardHTML(note) {
    const safeTitle = escHTML(note.title);
    const safePreview = escHTML(truncate(note.content, 120));
    const date = formatDate(note.createdAt);
    const badgeLabel = { 
        summary: 'Summary', 
        bookmark: 'Bookmark', 
        manual: 'Note',
        conversation: 'Conversation'  // NEW
    }[note.type] || 'Note';
    const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
    const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
    const expandOpen = note.expanded ? 'open' : '';
    const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

    return `
       <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
         <div class="note-card-top">
           <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" aria-label="Toggle note: ${safeTitle}" data-tooltip="Click to read the full note">
             <span class="note-title-text">${safeTitle}</span>
             <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
           </button>
           <div class="card-actions">
             <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
             <button class="card-icon-btn edit-btn" data-tooltip="Edit note title" aria-label="Edit note title" title="Edit title">✏️</button>
             <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
             </button>
             <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
             </button>
           </div>
         </div>
         <div class="note-preview">${safePreview}</div>
         <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
         <div class="note-footer">
           <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
           <span class="note-date">${date}</span>
           ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
         </div>
       </div>`;
}

(function patchRender() {
    const observer = new MutationObserver(() => {
        document.querySelectorAll('.note-expand').forEach(el => {
            const card = el.closest('.note-card');
            if (!card) return;
            const id = card.dataset.id;
            if (!id || el._filled) return;
            const note = notes.find(n => n.id === id);
            if (!note) return;
            el.textContent = note.content;
            el._filled = true;
        });
    });
    const list = document.getElementById('notesList');
    if (list) observer.observe(list, { childList: true, subtree: false });
})();

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════
function getSorted() {
    return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
}

function autoTitle(text) {
    const clean = text.replace(/\n/g, ' ').trim();
    const words = clean.split(/\s+/).slice(0, 7).join(' ');
    return clean.split(/\s+/).length > 7 ? words + '…' : words;
}

function truncate(text, maxLen) {
    const flat = text.replace(/\n/g, ' ');
    return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
}

function escHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function showResult(text, isPlain) {
    const box = document.getElementById('resultBox');
    const content = document.getElementById('resultContent');
    if (isPlain) {
        content.textContent = text;
    } else {
        content.innerHTML = text;
    }
    box.classList.remove('hidden');
}

function showSavePromptBar() {
    document.getElementById('savePromptBar').classList.remove('hidden');
}

function hideSavePromptBar() {
    document.getElementById('savePromptBar').classList.add('hidden');
    lastSummary = '';
}

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._tid);
    el._tid = setTimeout(() => el.classList.remove('show'), 2400);
}

function initTooltips() {
    const tip = document.getElementById('tooltip');
    let showTid = null;

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (!target) return;
        clearTimeout(showTid);
        showTid = setTimeout(() => {
            const msg = target.dataset.tooltip;
            if (!msg) return;
            tip.textContent = msg;
            positionTooltip(tip, target);
            tip.classList.add('visible');
            tip.removeAttribute('aria-hidden');
        }, 500);
    });

    document.addEventListener('mouseout', (e) => {
        if (!e.target.closest('[data-tooltip]')) return;
        clearTimeout(showTid);
        tip.classList.remove('visible');
        tip.setAttribute('aria-hidden', 'true');
    });
}

function positionTooltip(tip, target) {
    const rect = target.getBoundingClientRect();
    const tipW = 200;
    let left = rect.left + rect.width / 2 - tipW / 2;
    let top = rect.top - 36;

    if (left < 6) left = 6;
    if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
    if (top < 6) top = rect.bottom + 6;

    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
    tip.style.width = tipW + 'px';
}