// // // // // document.addEventListener('DOMContentLoaded', () => {
// // // // //     // Retrieve the stored research notes with the help of researchNotes key
// // // // //     chrome.storage.local.get(['researchNotes'], function (result) {
// // // // //         if (result.researchNotes) {
// // // // //             document.getElementById('notes').value = result.researchNotes;
// // // // //         }
// // // // //     });
// // // // //     document.getElementById('summarizeButton').addEventListener('click', summarizeText);
// // // // //     document.getElementById('saveNotes').addEventListener('click', saveNotes);
// // // // // });

// // // // // async function summarizeText() {
// // // // //     try {
// // // // //         // Get the current active tab
// // // // //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // // // //         // get the selected text from the active tab using content script
// // // // //         const [{ result }] = await chrome.scripting.executeScript({
// // // // //             target: { tabId: tab.id },
// // // // //             function: () => window.getSelection().toString()
// // // // //         });
// // // // //         // validate if there is no selected text present in the variable result
// // // // //         if (!result) {
// // // // //             showResult('Please select some text to summarize.');
// // // // //             return;
// // // // //         }

// // // // //         // API call to the backend server to summarize the text
// // // // //         // fetch from the end point and pass the selected text as a parameter in the request body
// // // // //         const response = await fetch('http://localhost:8080/api/research/process', {
// // // // //             method: 'POST',
// // // // //             headers: {
// // // // //                 'Content-Type': 'application/json'
// // // // //             },
// // // // //             body: JSON.stringify({ content: result, operation: 'summarize' })
// // // // //         });

// // // // //         // validate if the response is not successful
// // // // //         if (!response.ok) {
// // // // //             throw new Error(`API Error: ${response.status}`);
// // // // //         }

// // // // //         // if no error is there then get the summarized text from the response
// // // // //         const text = await response.text();
// // // // //         // replace newlines with <br> for HTML display
// // // // //         showResult(text.replace(/\n/g, '<br>'));


// // // // //     } catch (error) {
// // // // //         showResult('Error: ' + error.message);
// // // // //     }
// // // // // }

// // // // // async function saveNotes() {
// // // // //     const notes = document.getElementById('notes').value;
// // // // //     chrome.storage.local.set({ 'researchNotes': notes }, function () {
// // // // //         alert('Notes saved successfully!');
// // // // //     });
// // // // // }

// // // // // // function will display anything that we passed onto to the resultID
// // // // // function showResult(content) {
// // // // //     document.getElementById('results').innerHTML = `<div class = "result-item"><div class="result-content">${content}</div></div>`;
// // // // // }

// // // // /* ═══════════════════════════════════════════════════════
// // // //    Research Assistant — side_panel.js
// // // //    Bugs fixed: delete, expand, content rendering
// // // //    New: export (PDF/DOC), tooltips, elegant UI
// // // //    ═══════════════════════════════════════════════════════ */

// // // //    'use strict';

// // // //    // ── State ──────────────────────────────────────────────
// // // //    let notes = [];
// // // //    let lastSummary = '';

// // // //    // ── Boot ───────────────────────────────────────────────
// // // //    document.addEventListener('DOMContentLoaded', () => {
// // // //      loadNotes();
// // // //      bindButtons();
// // // //      initTooltips();
// // // //    });

// // // //    // ── Button bindings ────────────────────────────────────
// // // //    function bindButtons() {
// // // //      document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// // // //      document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// // // //      document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// // // //      document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
// // // //      document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// // // //      document.getElementById('noteExportPdf').addEventListener('click', () => {
// // // //        exportSingleNote(window._activeNoteId, 'pdf');
// // // //      });
// // // //      document.getElementById('noteExportDoc').addEventListener('click', () => {
// // // //        exportSingleNote(window._activeNoteId, 'doc');
// // // //      });
// // // //      document.getElementById('noteExportModal').addEventListener('click', (e) => {
// // // //        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// // // //      });

// // // //      document.getElementById('exportBtn').addEventListener('click', openExportModal);
// // // //      document.getElementById('closeExport').addEventListener('click', closeExportModal);
// // // //      document.getElementById('exportPdf').addEventListener('click', () => exportNotes('pdf'));
// // // //      document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// // // //      // Close modal on backdrop click
// // // //      document.getElementById('exportModal').addEventListener('click', (e) => {
// // // //        if (e.target === document.getElementById('exportModal')) closeExportModal();
// // // //      });
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 1 — Summarise selected text on page
// // // //    // ══════════════════════════════════════════════════════
// // // //    async function summarizeSelection() {
// // // //      try {
// // // //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // // //        const [{ result: sel }] = await chrome.scripting.executeScript({
// // // //          target: { tabId: tab.id },
// // // //          function: () => window.getSelection().toString()
// // // //        });

// // // //        if (!sel || !sel.trim()) {
// // // //          showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// // // //          return;
// // // //        }

// // // //        showResult('Summarising…', false);
// // // //        hideSavePromptBar();

// // // //        const res = await fetch('http://localhost:8080/api/research/process', {
// // // //          method: 'POST',
// // // //          headers: { 'Content-Type': 'application/json' },
// // // //          body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
// // // //        });
// // // //        if (!res.ok) throw new Error('API error ' + res.status);

// // // //        lastSummary = (await res.text()).trim();
// // // //        showResult(lastSummary, true);       // true = plain text, not HTML
// // // //        showSavePromptBar();

// // // //      } catch (err) {
// // // //        showResult('❌ ' + err.message, false);
// // // //        hideSavePromptBar();
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 2 — Bookmark: auto-summarise selection or
// // // //    //             save page URL — no manual pasting needed
// // // //    // ══════════════════════════════════════════════════════
// // // //    async function bookmarkPage() {
// // // //      try {
// // // //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // // //        const [{ result: sel }] = await chrome.scripting.executeScript({
// // // //          target: { tabId: tab.id },
// // // //          function: () => window.getSelection().toString()
// // // //        });

// // // //        const content = (sel || '').trim();

// // // //        if (!content) {
// // // //          // No selection — save page as a plain bookmark
// // // //          const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// // // //          saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// // // //          toast('📌 Page bookmarked!');
// // // //          return;
// // // //        }

// // // //        toast('Summarising & saving…');
// // // //        const res = await fetch('http://localhost:8080/api/research/process', {
// // // //          method: 'POST',
// // // //          headers: { 'Content-Type': 'application/json' },
// // // //          body: JSON.stringify({ content, operation: 'summarize' })
// // // //        });
// // // //        if (!res.ok) throw new Error('API error ' + res.status);

// // // //        const summary = (await res.text()).trim();
// // // //        saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// // // //        toast('✅ Bookmarked & summarised!');

// // // //      } catch (err) {
// // // //        toast('❌ ' + err.message);
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 3 — Save the summary shown in result box
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveSummaryAsNote() {
// // // //      if (!lastSummary) return;
// // // //      saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// // // //      hideSavePromptBar();
// // // //      toast('✅ Summary saved to notes!');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 4 — Save manually typed note
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveManualNote() {
// // // //      const el = document.getElementById('quickNoteInput');
// // // //      const text = el.value.trim();
// // // //      if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// // // //      saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// // // //      el.value = '';
// // // //      toast('✅ Note saved!');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // CORE — Add note to state + storage + re-render
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveNote({ title, content, type }) {
// // // //      const note = {
// // // //        id: 'n' + Date.now(),          // safe prefix avoids pure-numeric ID edge cases
// // // //        title: title || 'Untitled',
// // // //        content: content || '',
// // // //        type: type || 'manual',
// // // //        pinned: false,
// // // //        expanded: false,
// // // //        createdAt: new Date().toISOString()
// // // //      };
// // // //      notes.unshift(note);
// // // //      persistNotes();
// // // //      renderNotes();
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 5 — Pin / unpin   (uses data-id, not inline onclick)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function togglePin(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      note.pinned = !note.pinned;
// // // //      persistNotes();
// // // //      renderNotes();
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 6 — Delete   ← BUG FIX: was using bad filter
// // // //    // ══════════════════════════════════════════════════════
// // // //    function deleteNote(id) {
// // // //      const idx = notes.findIndex(n => n.id === id);
// // // //      if (idx === -1) return;
// // // //      notes.splice(idx, 1);
// // // //      persistNotes();
// // // //      renderNotes();
// // // //      toast('🗑 Note deleted');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 7 — Expand / collapse note content
// // // //    //   ← BUG FIX: toggling .open class on the .note-expand
// // // //    //     element directly found by id, no innerHTML re-render
// // // //    // ══════════════════════════════════════════════════════
// // // //    function toggleExpand(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      note.expanded = !note.expanded;
// // // //      // Directly show/hide the expand div — no re-render needed
// // // //      const expandEl = document.getElementById('exp-' + id);
// // // //      if (expandEl) expandEl.classList.toggle('open', note.expanded);

// // // //      // Rotate the chevron icon on the title button
// // // //      const titleBtn = document.getElementById('tbtn-' + id);
// // // //      if (titleBtn) {
// // // //        const chev = titleBtn.querySelector('.chev');
// // // //        if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 8 — Export notes (PDF or DOC/TXT)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function openExportModal() {
// // // //      if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// // // //      document.getElementById('exportModal').classList.remove('hidden');
// // // //    }
// // // //    function closeExportModal() {
// // // //      document.getElementById('exportModal').classList.add('hidden');
// // // //    }

// // // //    function exportNotes(format) {
// // // //      closeExportModal();

// // // //      if (format === 'pdf') {
// // // //        exportAsPdf();
// // // //      } else {
// // // //        exportAsDoc();
// // // //      }
// // // //    }

// // // //    function exportAsPdf() {
// // // //      // Build a printable HTML page and open it in a new tab for the user to "Print → Save as PDF"
// // // //      const sorted = getSorted();
// // // //      let rows = sorted.map(n => {
// // // //        const date = formatDate(n.createdAt);
// // // //        const safeTitle = escHTML(n.title);
// // // //        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// // // //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // // //        const pinMark = n.pinned ? ' 📌' : '';
// // // //        return `
// // // //          <div class="note">
// // // //            <div class="note-head">
// // // //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// // // //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// // // //              <span class="date">${date}</span>
// // // //            </div>
// // // //            <h2>${safeTitle}${pinMark}</h2>
// // // //            <p>${safeContent}</p>
// // // //          </div>`;
// // // //      }).join('');

// // // //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // // //        <title>Research Notes Export</title>
// // // //        <style>
// // // //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// // // //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// // // //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// // // //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px;page-break-inside:avoid}
// // // //          .note-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
// // // //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// // // //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// // // //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px}
// // // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // // //          .pin{font-size:10px;color:#e67700;font-weight:600}
// // // //          .date{font-size:10px;color:#aaa;margin-left:auto}
// // // //          @media print{body{padding:16px}.note{border:1px solid #ccc}}
// // // //        </style>
// // // //      </head><body>
// // // //        <h1>Research Notes</h1>
// // // //        <div class="meta">Exported ${new Date().toLocaleString()} · ${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
// // // //        ${rows}
// // // //        <script>window.onload=()=>window.print();<\/script>
// // // //      </body></html>`;

// // // //      const blob = new Blob([html], { type: 'text/html' });
// // // //      const url = URL.createObjectURL(blob);
// // // //      chrome.tabs.create({ url });
// // // //      toast('📄 PDF export opened — use Print → Save as PDF');
// // // //    }

// // // //    function exportAsDoc() {
// // // //      // Build a plain-text file downloadable as .txt (Word-compatible)
// // // //      const sorted = getSorted();
// // // //      const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// // // //      sorted.forEach((n, i) => {
// // // //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // // //        lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// // // //        lines.push(n.title);
// // // //        lines.push('');
// // // //        lines.push(n.content);
// // // //        lines.push('');
// // // //      });

// // // //      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
// // // //      const url = URL.createObjectURL(blob);
// // // //      const a = document.createElement('a');
// // // //      a.href = url;
// // // //      a.download = 'research-notes.txt';
// // // //      a.click();
// // // //      URL.revokeObjectURL(url);
// // // //      toast('📝 Notes downloaded as .txt');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 9 — Export a single note (PDF or DOC)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function openNoteExportModal(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      window._activeNoteId = id;
// // // //      // Show note title in the modal so user knows which note they're exporting
// // // //      document.getElementById('noteExportTitle').textContent = note.title;
// // // //      document.getElementById('noteExportModal').classList.remove('hidden');
// // // //    }

// // // //    function closeNoteExportModal() {
// // // //      document.getElementById('noteExportModal').classList.add('hidden');
// // // //      window._activeNoteId = null;
// // // //    }

// // // //    function exportSingleNote(id, format) {
// // // //      closeNoteExportModal();
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;

// // // //      if (format === 'pdf') {
// // // //        exportSingleNoteAsPdf(note);
// // // //      } else {
// // // //        exportSingleNoteAsDoc(note);
// // // //      }
// // // //    }

// // // //    function exportSingleNoteAsPdf(note) {
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const safeTitle = escHTML(note.title);
// // // //      const safeContent = escHTML(note.content).replace(/\n/g, '<br>');
// // // //      const pinMark = note.pinned ? '<span class="pin">📌 Pinned</span>' : '';

// // // //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // // //        <title>${safeTitle}</title>
// // // //        <style>
// // // //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// // // //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
// // // //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.4px}
// // // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // // //          .pin{font-size:11px;color:#e67700;font-weight:600}
// // // //          .date{font-size:11px;color:#8a90a8}
// // // //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// // // //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// // // //          @media print{body{padding:20px}}
// // // //        </style>
// // // //      </head><body>
// // // //        <div class="meta">
// // // //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// // // //          ${pinMark}
// // // //          <span class="date">${date}</span>
// // // //        </div>
// // // //        <h1>${safeTitle}</h1>
// // // //        <p>${safeContent}</p>
// // // //        <script>window.onload=()=>window.print();<\/script>
// // // //      </body></html>`;

// // // //      const blob = new Blob([html], { type: 'text/html' });
// // // //      chrome.tabs.create({ url: URL.createObjectURL(blob) });
// // // //      toast('📄 Note opened — use Print → Save as PDF');
// // // //    }

// // // //    function exportSingleNoteAsDoc(note) {
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const lines = [
// // // //        note.title,
// // // //        '='.repeat(Math.min(note.title.length, 60)),
// // // //        `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// // // //        `Date: ${date}`,
// // // //        '',
// // // //        note.content
// // // //      ];

// // // //      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
// // // //      const url = URL.createObjectURL(blob);
// // // //      const a = document.createElement('a');
// // // //      a.href = url;
// // // //      // Slugify the title for the filename
// // // //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// // // //      a.download = `note-${slug}.txt`;
// // // //      a.click();
// // // //      URL.revokeObjectURL(url);
// // // //      toast('📝 Note downloaded as .txt');
// // // //    }


// // // //    function loadNotes() {
// // // //      chrome.storage.local.get(['researchNotesV2'], (result) => {
// // // //        notes = result.researchNotesV2 || [];
// // // //        renderNotes();
// // // //      });
// // // //    }
// // // //    function persistNotes() {
// // // //      chrome.storage.local.set({ researchNotesV2: notes });
// // // //    }

// // // //    // ── Render ─────────────────────────────────────────────
// // // //    function renderNotes() {
// // // //      const list = document.getElementById('notesList');
// // // //      const countEl = document.getElementById('noteCount');
// // // //      countEl.textContent = notes.length;

// // // //      if (!notes.length) {
// // // //        list.innerHTML = `
// // // //          <div class="empty-state">
// // // //            <span class="empty-icon">🗒️</span>
// // // //            <p>No notes yet.<br>Summarise text or bookmark a page to get started.</p>
// // // //          </div>`;
// // // //        return;
// // // //      }

// // // //      list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// // // //      // ── Attach events via JS (NOT inline onclick) ─────────
// // // //      // This is the correct fix: event delegation from the list
// // // //      list.querySelectorAll('.note-card').forEach(card => {
// // // //        const id = card.dataset.id;

// // // //        // Title / expand button
// // // //        const titleBtn = card.querySelector('.note-title-btn');
// // // //        if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));

// // // //        // Download (per-note export) button
// // // //        const dlBtn = card.querySelector('.dl-btn');
// // // //        if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));

// // // //        // Pin button
// // // //        const pinBtn = card.querySelector('.pin-btn');
// // // //        if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));

// // // //        // Delete button
// // // //        const delBtn = card.querySelector('.del-btn');
// // // //        if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// // // //      });
// // // //    }

// // // //    // ── Card HTML builder ──────────────────────────────────
// // // //    // NOTE: content is stored and displayed as PLAIN TEXT.
// // // //    // escHTML() is used for the preview/title only.
// // // //    // The expand area uses textContent via CSS white-space:pre-wrap
// // // //    // so no escaping needed and <br> injection bug is gone.
// // // //    function buildCardHTML(note) {
// // // //      const safeTitle = escHTML(note.title);
// // // //      const safePreview = escHTML(truncate(note.content, 120));
// // // //      // For the expand area we store the raw content and set
// // // //      // it via textContent after insertion (see renderNotes event binding below)
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// // // //      const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// // // //      const expandOpen = note.expanded ? 'open' : '';
// // // //      const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// // // //      return `
// // // //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// // // //          <div class="note-card-top">
// // // //            <button class="note-title-btn" id="tbtn-${note.id}"
// // // //              aria-expanded="${note.expanded}"
// // // //              aria-label="Toggle note: ${safeTitle}"
// // // //              data-tooltip="Click to read the full note">
// // // //              <span class="note-title-text">${safeTitle}</span>
// // // //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// // // //            </button>
// // // //            <div class="card-actions">
// // // //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// // // //              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
// // // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
// // // //              </button>
// // // //              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
// // // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
// // // //              </button>
// // // //            </div>
// // // //          </div>
// // // //          <div class="note-preview">${safePreview}</div>
// // // //          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
// // // //          <div class="note-footer">
// // // //            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
// // // //            <span class="note-date">${date}</span>
// // // //            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
// // // //          </div>
// // // //        </div>`;
// // // //    }

// // // //    // ── After render: inject full content as textContent ───
// // // //    // This completely avoids the <br> / HTML injection bug.
// // // //    // We override renderNotes to do a second pass:
// // // //    const _renderNotes = renderNotes;
// // // //    // Re-assign with post-pass
// // // //    (function patchRender() {
// // // //      const original = window.renderNotes || renderNotes;
// // // //      // After innerHTML is set, fill expand divs with plain text
// // // //      const observer = new MutationObserver(() => {
// // // //        document.querySelectorAll('.note-expand').forEach(el => {
// // // //          const card = el.closest('.note-card');
// // // //          if (!card) return;
// // // //          const id = card.dataset.id;
// // // //          if (!id || el._filled) return;
// // // //          const note = notes.find(n => n.id === id);
// // // //          if (!note) return;
// // // //          el.textContent = note.content;   // plain text, no escaping needed
// // // //          el._filled = true;
// // // //        });
// // // //      });
// // // //      observer.observe(document.getElementById('notesList'), { childList: true, subtree: false });
// // // //    })();

// // // //    // ── Helpers ────────────────────────────────────────────
// // // //    function getSorted() {
// // // //      return [
// // // //        ...notes.filter(n => n.pinned),
// // // //        ...notes.filter(n => !n.pinned)
// // // //      ];
// // // //    }

// // // //    function autoTitle(text) {
// // // //      const clean = text.replace(/\n/g, ' ').trim();
// // // //      const words = clean.split(/\s+/).slice(0, 7).join(' ');
// // // //      return clean.split(/\s+/).length > 7 ? words + '…' : words;
// // // //    }

// // // //    function truncate(text, maxLen) {
// // // //      const flat = text.replace(/\n/g, ' ');
// // // //      return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// // // //    }

// // // //    function escHTML(str) {
// // // //      return String(str)
// // // //        .replace(/&/g, '&amp;')
// // // //        .replace(/</g, '&lt;')
// // // //        .replace(/>/g, '&gt;')
// // // //        .replace(/"/g, '&quot;');
// // // //    }

// // // //    function formatDate(iso) {
// // // //      const d = new Date(iso);
// // // //      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
// // // //        + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// // // //    }

// // // //    // ── Result box helpers ──────────────────────────────────
// // // //    function showResult(text, isPlain) {
// // // //      const box = document.getElementById('resultBox');
// // // //      const content = document.getElementById('resultContent');
// // // //      if (isPlain) {
// // // //        content.textContent = text;   // plain text — safe, no XSS
// // // //      } else {
// // // //        content.innerHTML = text;     // only used for internal status messages
// // // //      }
// // // //      box.classList.remove('hidden');
// // // //    }

// // // //    function showSavePromptBar() {
// // // //      document.getElementById('savePromptBar').classList.remove('hidden');
// // // //    }
// // // //    function hideSavePromptBar() {
// // // //      document.getElementById('savePromptBar').classList.add('hidden');
// // // //      lastSummary = '';
// // // //    }

// // // //    // ── Toast ──────────────────────────────────────────────
// // // //    function toast(msg) {
// // // //      const el = document.getElementById('toast');
// // // //      el.textContent = msg;
// // // //      el.classList.add('show');
// // // //      clearTimeout(el._tid);
// // // //      el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// // // //    }

// // // //    // ── Tooltip system ─────────────────────────────────────
// // // //    function initTooltips() {
// // // //      const tip = document.getElementById('tooltip');
// // // //      let hoverEl = null;
// // // //      let showTid = null;

// // // //      document.addEventListener('mouseover', (e) => {
// // // //        const target = e.target.closest('[data-tooltip]');
// // // //        if (!target) return;
// // // //        hoverEl = target;
// // // //        clearTimeout(showTid);
// // // //        showTid = setTimeout(() => {
// // // //          const msg = target.dataset.tooltip;
// // // //          if (!msg) return;
// // // //          tip.textContent = msg;
// // // //          positionTooltip(tip, target);
// // // //          tip.classList.add('visible');
// // // //          tip.removeAttribute('aria-hidden');
// // // //        }, 500);
// // // //      });

// // // //      document.addEventListener('mouseout', (e) => {
// // // //        if (!e.target.closest('[data-tooltip]')) return;
// // // //        clearTimeout(showTid);
// // // //        tip.classList.remove('visible');
// // // //        tip.setAttribute('aria-hidden', 'true');
// // // //        hoverEl = null;
// // // //      });
// // // //    }

// // // //    function positionTooltip(tip, target) {
// // // //      const rect = target.getBoundingClientRect();
// // // //      const tipW = 200;
// // // //      let left = rect.left + rect.width / 2 - tipW / 2;
// // // //      let top = rect.top - 36;

// // // //      // Keep within viewport
// // // //      if (left < 6) left = 6;
// // // //      if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// // // //      if (top < 6) top = rect.bottom + 6;

// // // //      tip.style.left = left + 'px';
// // // //      tip.style.top = top + 'px';
// // // //      tip.style.width = tipW + 'px';
// // // //    }


// // // // /* ═══════════════════════════════════════════════════════
// // // //    Research Assistant — side_panel.js
// // // //    Bugs fixed: delete, expand, content rendering
// // // //    New: export (PDF/DOC), tooltips, elegant UI
// // // //    ═══════════════════════════════════════════════════════ */

// // // //    'use strict';

// // // //    // ── State ──────────────────────────────────────────────
// // // //    let notes = [];
// // // //    let lastSummary = '';

// // // //    // ── Boot ───────────────────────────────────────────────
// // // //    document.addEventListener('DOMContentLoaded', () => {
// // // //      loadNotes();
// // // //      bindButtons();
// // // //      initTooltips();
// // // //    });

// // // //    // ── Button bindings ────────────────────────────────────
// // // //    function bindButtons() {
// // // //      document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// // // //      document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// // // //      document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// // // //      document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
// // // //      document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// // // //      document.getElementById('noteExportPdf').addEventListener('click', () => {
// // // //        exportSingleNote(window._activeNoteId, 'pdf');
// // // //      });
// // // //      document.getElementById('noteExportDoc').addEventListener('click', () => {
// // // //        exportSingleNote(window._activeNoteId, 'doc');
// // // //      });
// // // //      document.getElementById('noteExportModal').addEventListener('click', (e) => {
// // // //        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// // // //      });

// // // //      document.getElementById('exportBtn').addEventListener('click', openExportModal);
// // // //      document.getElementById('closeExport').addEventListener('click', closeExportModal);
// // // //      document.getElementById('exportPdf').addEventListener('click', () => exportNotes('pdf'));
// // // //      document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// // // //      // Close modal on backdrop click
// // // //      document.getElementById('exportModal').addEventListener('click', (e) => {
// // // //        if (e.target === document.getElementById('exportModal')) closeExportModal();
// // // //      });
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 1 — Summarise selected text on page
// // // //    // ══════════════════════════════════════════════════════
// // // //    async function summarizeSelection() {
// // // //      try {
// // // //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // // //        const [{ result: sel }] = await chrome.scripting.executeScript({
// // // //          target: { tabId: tab.id },
// // // //          function: () => window.getSelection().toString()
// // // //        });

// // // //        if (!sel || !sel.trim()) {
// // // //          showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// // // //          return;
// // // //        }

// // // //        showResult('Summarising…', false);
// // // //        hideSavePromptBar();

// // // //        const res = await fetch('http://localhost:8080/api/research/process', {
// // // //          method: 'POST',
// // // //          headers: { 'Content-Type': 'application/json' },
// // // //          body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
// // // //        });
// // // //        if (!res.ok) throw new Error('API error ' + res.status);

// // // //        lastSummary = (await res.text()).trim();
// // // //        showResult(lastSummary, true);       // true = plain text, not HTML
// // // //        showSavePromptBar();

// // // //      } catch (err) {
// // // //        showResult('❌ ' + err.message, false);
// // // //        hideSavePromptBar();
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 2 — Bookmark: auto-summarise selection or
// // // //    //             save page URL — no manual pasting needed
// // // //    // ══════════════════════════════════════════════════════
// // // //    async function bookmarkPage() {
// // // //      try {
// // // //        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // // //        const [{ result: sel }] = await chrome.scripting.executeScript({
// // // //          target: { tabId: tab.id },
// // // //          function: () => window.getSelection().toString()
// // // //        });

// // // //        const content = (sel || '').trim();

// // // //        if (!content) {
// // // //          // No selection — save page as a plain bookmark
// // // //          const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// // // //          saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// // // //          toast('📌 Page bookmarked!');
// // // //          return;
// // // //        }

// // // //        toast('Summarising & saving…');
// // // //        const res = await fetch('http://localhost:8080/api/research/process', {
// // // //          method: 'POST',
// // // //          headers: { 'Content-Type': 'application/json' },
// // // //          body: JSON.stringify({ content, operation: 'summarize' })
// // // //        });
// // // //        if (!res.ok) throw new Error('API error ' + res.status);

// // // //        const summary = (await res.text()).trim();
// // // //        saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// // // //        toast('✅ Bookmarked & summarised!');

// // // //      } catch (err) {
// // // //        toast('❌ ' + err.message);
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 3 — Save the summary shown in result box
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveSummaryAsNote() {
// // // //      if (!lastSummary) return;
// // // //      saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// // // //      hideSavePromptBar();
// // // //      toast('✅ Summary saved to notes!');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 4 — Save manually typed note
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveManualNote() {
// // // //      const el = document.getElementById('quickNoteInput');
// // // //      const text = el.value.trim();
// // // //      if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// // // //      saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// // // //      el.value = '';
// // // //      toast('✅ Note saved!');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // CORE — Add note to state + storage + re-render
// // // //    // ══════════════════════════════════════════════════════
// // // //    function saveNote({ title, content, type }) {
// // // //      const note = {
// // // //        id: 'n' + Date.now(),          // safe prefix avoids pure-numeric ID edge cases
// // // //        title: title || 'Untitled',
// // // //        content: content || '',
// // // //        type: type || 'manual',
// // // //        pinned: false,
// // // //        expanded: false,
// // // //        createdAt: new Date().toISOString()
// // // //      };
// // // //      notes.unshift(note);
// // // //      persistNotes();
// // // //      renderNotes();
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 5 — Pin / unpin   (uses data-id, not inline onclick)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function togglePin(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      note.pinned = !note.pinned;
// // // //      persistNotes();
// // // //      renderNotes();
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 6 — Delete   ← BUG FIX: was using bad filter
// // // //    // ══════════════════════════════════════════════════════
// // // //    function deleteNote(id) {
// // // //      const idx = notes.findIndex(n => n.id === id);
// // // //      if (idx === -1) return;
// // // //      notes.splice(idx, 1);
// // // //      persistNotes();
// // // //      renderNotes();
// // // //      toast('🗑 Note deleted');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 7 — Expand / collapse note content
// // // //    //   ← BUG FIX: toggling .open class on the .note-expand
// // // //    //     element directly found by id, no innerHTML re-render
// // // //    // ══════════════════════════════════════════════════════
// // // //    function toggleExpand(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      note.expanded = !note.expanded;
// // // //      // Directly show/hide the expand div — no re-render needed
// // // //      const expandEl = document.getElementById('exp-' + id);
// // // //      if (expandEl) expandEl.classList.toggle('open', note.expanded);

// // // //      // Rotate the chevron icon on the title button
// // // //      const titleBtn = document.getElementById('tbtn-' + id);
// // // //      if (titleBtn) {
// // // //        const chev = titleBtn.querySelector('.chev');
// // // //        if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// // // //      }
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 8 — Export notes (PDF or DOC/TXT)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function openExportModal() {
// // // //      if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// // // //      document.getElementById('exportModal').classList.remove('hidden');
// // // //    }
// // // //    function closeExportModal() {
// // // //      document.getElementById('exportModal').classList.add('hidden');
// // // //    }

// // // //    function exportNotes(format) {
// // // //      closeExportModal();

// // // //      if (format === 'pdf') {
// // // //        exportAsPdf();
// // // //      } else {
// // // //        exportAsDoc();
// // // //      }
// // // //    }

// // // //    function exportAsPdf() {
// // // //      // Build a printable HTML page and open it in a new tab for the user to "Print → Save as PDF"
// // // //      const sorted = getSorted();
// // // //      let rows = sorted.map(n => {
// // // //        const date = formatDate(n.createdAt);
// // // //        const safeTitle = escHTML(n.title);
// // // //        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// // // //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // // //        const pinMark = n.pinned ? ' 📌' : '';
// // // //        return `
// // // //          <div class="note">
// // // //            <div class="note-head">
// // // //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// // // //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// // // //              <span class="date">${date}</span>
// // // //            </div>
// // // //            <h2>${safeTitle}${pinMark}</h2>
// // // //            <p>${safeContent}</p>
// // // //          </div>`;
// // // //      }).join('');

// // // //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // // //        <title>Research Notes Export</title>
// // // //        <style>
// // // //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// // // //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// // // //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// // // //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px;page-break-inside:avoid}
// // // //          .note-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
// // // //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// // // //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// // // //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px}
// // // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // // //          .pin{font-size:10px;color:#e67700;font-weight:600}
// // // //          .date{font-size:10px;color:#aaa;margin-left:auto}
// // // //          @media print{body{padding:16px}.note{border:1px solid #ccc}}
// // // //        </style>
// // // //      </head><body>
// // // //        <h1>Research Notes</h1>
// // // //        <div class="meta">Exported ${new Date().toLocaleString()} · ${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
// // // //        ${rows}
// // // //      </body></html>`;

// // // //      downloadViaBlob(html, 'research-notes.html', 'text/html');
// // // //      toast('📄 research-notes.html saved — open it and Print → Save as PDF');
// // // //    }

// // // //    function exportAsDoc() {
// // // //      const sorted = getSorted();
// // // //      const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// // // //      sorted.forEach((n, i) => {
// // // //        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // // //        lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// // // //        lines.push(n.title);
// // // //        lines.push('');
// // // //        lines.push(n.content);
// // // //        lines.push('');
// // // //      });

// // // //      downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
// // // //      toast('📝 research-notes.txt saved to Downloads!');
// // // //    }

// // // //    // ══════════════════════════════════════════════════════
// // // //    // FEATURE 9 — Export a single note (PDF or DOC)
// // // //    // ══════════════════════════════════════════════════════
// // // //    function openNoteExportModal(id) {
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;
// // // //      window._activeNoteId = id;
// // // //      // Show note title in the modal so user knows which note they're exporting
// // // //      document.getElementById('noteExportTitle').textContent = note.title;
// // // //      document.getElementById('noteExportModal').classList.remove('hidden');
// // // //    }

// // // //    function closeNoteExportModal() {
// // // //      document.getElementById('noteExportModal').classList.add('hidden');
// // // //      window._activeNoteId = null;
// // // //    }

// // // //    function exportSingleNote(id, format) {
// // // //      closeNoteExportModal();
// // // //      const note = notes.find(n => n.id === id);
// // // //      if (!note) return;

// // // //      if (format === 'pdf') {
// // // //        exportSingleNoteAsPdf(note);
// // // //      } else {
// // // //        exportSingleNoteAsDoc(note);
// // // //      }
// // // //    }

// // // //    function exportSingleNoteAsPdf(note) {
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const safeTitle = escHTML(note.title);
// // // //      const safeContent = escHTML(note.content).replace(/\n/g, '<br>');
// // // //      const pinMark = note.pinned ? '<span class="pin">📌 Pinned</span>' : '';

// // // //      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // // //        <title>${safeTitle}</title>
// // // //        <style>
// // // //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// // // //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
// // // //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.4px}
// // // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // // //          .pin{font-size:11px;color:#e67700;font-weight:600}
// // // //          .date{font-size:11px;color:#8a90a8}
// // // //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// // // //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// // // //          @media print{body{padding:20px}}
// // // //        </style>
// // // //      </head><body>
// // // //        <div class="meta">
// // // //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// // // //          ${pinMark}
// // // //          <span class="date">${date}</span>
// // // //        </div>
// // // //        <h1>${safeTitle}</h1>
// // // //        <p>${safeContent}</p>
// // // //      </body></html>`;

// // // //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// // // //      downloadViaBlob(html, `note-${slug}.html`, 'text/html');
// // // //      toast('📄 note saved as .html — open it and Print → Save as PDF');
// // // //    }

// // // //    function exportSingleNoteAsDoc(note) {
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const lines = [
// // // //        note.title,
// // // //        '='.repeat(Math.min(note.title.length, 60)),
// // // //        `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// // // //        `Date: ${date}`,
// // // //        '',
// // // //        note.content
// // // //      ];

// // // //      const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// // // //      downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
// // // //      toast('📝 note saved to Downloads!');
// // // //    }

// // // //    // ── Download helper ────────────────────────────────────
// // // //    // chrome.downloads.download() is the ONLY reliable way to save
// // // //    // files from a Chrome extension side panel to the user's system.
// // // //    // blob URL + chrome.tabs.create(), or anchor.click(), do NOT work
// // // //    // in extensions because blob URLs are scoped to the creating context.
// // // //    function downloadViaBlob(content, filename, mimeType) {
// // // //      // FileReader converts the Blob to a base64 data URL.
// // // //      // chrome.downloads.download() accepts data URLs and saves them
// // // //      // directly to the user's Downloads folder — no new tab needed.
// // // //      const blob = new Blob([content], { type: mimeType });
// // // //      const reader = new FileReader();
// // // //      reader.onloadend = () => {
// // // //        chrome.downloads.download({
// // // //          url: reader.result,   // e.g. "data:text/plain;base64,..."
// // // //          filename: filename,   // shown in Downloads bar & saved filename
// // // //          saveAs: false         // save directly; set true to show Save dialog
// // // //        }, (downloadId) => {
// // // //          if (chrome.runtime.lastError) {
// // // //            toast('❌ Download error: ' + chrome.runtime.lastError.message);
// // // //          }
// // // //        });
// // // //      };
// // // //      reader.readAsDataURL(blob);
// // // //    }

// // // //    function loadNotes() {
// // // //      chrome.storage.local.get(['researchNotesV2'], (result) => {
// // // //        notes = result.researchNotesV2 || [];
// // // //        renderNotes();
// // // //      });
// // // //    }
// // // //    function persistNotes() {
// // // //      chrome.storage.local.set({ researchNotesV2: notes });
// // // //    }

// // // //    // ── Render ─────────────────────────────────────────────
// // // //    function renderNotes() {
// // // //      const list = document.getElementById('notesList');
// // // //      const countEl = document.getElementById('noteCount');
// // // //      countEl.textContent = notes.length;

// // // //      if (!notes.length) {
// // // //        list.innerHTML = `
// // // //          <div class="empty-state">
// // // //            <span class="empty-icon">🗒️</span>
// // // //            <p>No notes yet.<br>Summarise text or bookmark a page to get started.</p>
// // // //          </div>`;
// // // //        return;
// // // //      }

// // // //      list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// // // //      // ── Attach events via JS (NOT inline onclick) ─────────
// // // //      // This is the correct fix: event delegation from the list
// // // //      list.querySelectorAll('.note-card').forEach(card => {
// // // //        const id = card.dataset.id;

// // // //        // Title / expand button
// // // //        const titleBtn = card.querySelector('.note-title-btn');
// // // //        if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));

// // // //        // Download (per-note export) button
// // // //        const dlBtn = card.querySelector('.dl-btn');
// // // //        if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));

// // // //        // Pin button
// // // //        const pinBtn = card.querySelector('.pin-btn');
// // // //        if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));

// // // //        // Delete button
// // // //        const delBtn = card.querySelector('.del-btn');
// // // //        if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// // // //      });
// // // //    }

// // // //    // ── Card HTML builder ──────────────────────────────────
// // // //    // NOTE: content is stored and displayed as PLAIN TEXT.
// // // //    // escHTML() is used for the preview/title only.
// // // //    // The expand area uses textContent via CSS white-space:pre-wrap
// // // //    // so no escaping needed and <br> injection bug is gone.
// // // //    function buildCardHTML(note) {
// // // //      const safeTitle = escHTML(note.title);
// // // //      const safePreview = escHTML(truncate(note.content, 120));
// // // //      // For the expand area we store the raw content and set
// // // //      // it via textContent after insertion (see renderNotes event binding below)
// // // //      const date = formatDate(note.createdAt);
// // // //      const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // // //      const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// // // //      const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// // // //      const expandOpen = note.expanded ? 'open' : '';
// // // //      const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// // // //      return `
// // // //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// // // //          <div class="note-card-top">
// // // //            <button class="note-title-btn" id="tbtn-${note.id}"
// // // //              aria-expanded="${note.expanded}"
// // // //              aria-label="Toggle note: ${safeTitle}"
// // // //              data-tooltip="Click to read the full note">
// // // //              <span class="note-title-text">${safeTitle}</span>
// // // //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// // // //            </button>
// // // //            <div class="card-actions">
// // // //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// // // //              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
// // // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
// // // //              </button>
// // // //              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
// // // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
// // // //              </button>
// // // //            </div>
// // // //          </div>
// // // //          <div class="note-preview">${safePreview}</div>
// // // //          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
// // // //          <div class="note-footer">
// // // //            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
// // // //            <span class="note-date">${date}</span>
// // // //            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
// // // //          </div>
// // // //        </div>`;
// // // //    }

// // // //    // ── After render: inject full content as textContent ───
// // // //    // This completely avoids the <br> / HTML injection bug.
// // // //    // We override renderNotes to do a second pass:
// // // //    const _renderNotes = renderNotes;
// // // //    // Re-assign with post-pass
// // // //    (function patchRender() {
// // // //      const original = window.renderNotes || renderNotes;
// // // //      // After innerHTML is set, fill expand divs with plain text
// // // //      const observer = new MutationObserver(() => {
// // // //        document.querySelectorAll('.note-expand').forEach(el => {
// // // //          const card = el.closest('.note-card');
// // // //          if (!card) return;
// // // //          const id = card.dataset.id;
// // // //          if (!id || el._filled) return;
// // // //          const note = notes.find(n => n.id === id);
// // // //          if (!note) return;
// // // //          el.textContent = note.content;   // plain text, no escaping needed
// // // //          el._filled = true;
// // // //        });
// // // //      });
// // // //      observer.observe(document.getElementById('notesList'), { childList: true, subtree: false });
// // // //    })();

// // // //    // ── Helpers ────────────────────────────────────────────
// // // //    function getSorted() {
// // // //      return [
// // // //        ...notes.filter(n => n.pinned),
// // // //        ...notes.filter(n => !n.pinned)
// // // //      ];
// // // //    }

// // // //    function autoTitle(text) {
// // // //      const clean = text.replace(/\n/g, ' ').trim();
// // // //      const words = clean.split(/\s+/).slice(0, 7).join(' ');
// // // //      return clean.split(/\s+/).length > 7 ? words + '…' : words;
// // // //    }

// // // //    function truncate(text, maxLen) {
// // // //      const flat = text.replace(/\n/g, ' ');
// // // //      return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// // // //    }

// // // //    function escHTML(str) {
// // // //      return String(str)
// // // //        .replace(/&/g, '&amp;')
// // // //        .replace(/</g, '&lt;')
// // // //        .replace(/>/g, '&gt;')
// // // //        .replace(/"/g, '&quot;');
// // // //    }

// // // //    function formatDate(iso) {
// // // //      const d = new Date(iso);
// // // //      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
// // // //        + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// // // //    }

// // // //    // ── Result box helpers ──────────────────────────────────
// // // //    function showResult(text, isPlain) {
// // // //      const box = document.getElementById('resultBox');
// // // //      const content = document.getElementById('resultContent');
// // // //      if (isPlain) {
// // // //        content.textContent = text;   // plain text — safe, no XSS
// // // //      } else {
// // // //        content.innerHTML = text;     // only used for internal status messages
// // // //      }
// // // //      box.classList.remove('hidden');
// // // //    }

// // // //    function showSavePromptBar() {
// // // //      document.getElementById('savePromptBar').classList.remove('hidden');
// // // //    }
// // // //    function hideSavePromptBar() {
// // // //      document.getElementById('savePromptBar').classList.add('hidden');
// // // //      lastSummary = '';
// // // //    }

// // // //    // ── Toast ──────────────────────────────────────────────
// // // //    function toast(msg) {
// // // //      const el = document.getElementById('toast');
// // // //      el.textContent = msg;
// // // //      el.classList.add('show');
// // // //      clearTimeout(el._tid);
// // // //      el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// // // //    }

// // // //    // ── Tooltip system ─────────────────────────────────────
// // // //    function initTooltips() {
// // // //      const tip = document.getElementById('tooltip');
// // // //      let hoverEl = null;
// // // //      let showTid = null;

// // // //      document.addEventListener('mouseover', (e) => {
// // // //        const target = e.target.closest('[data-tooltip]');
// // // //        if (!target) return;
// // // //        hoverEl = target;
// // // //        clearTimeout(showTid);
// // // //        showTid = setTimeout(() => {
// // // //          const msg = target.dataset.tooltip;
// // // //          if (!msg) return;
// // // //          tip.textContent = msg;
// // // //          positionTooltip(tip, target);
// // // //          tip.classList.add('visible');
// // // //          tip.removeAttribute('aria-hidden');
// // // //        }, 500);
// // // //      });

// // // //      document.addEventListener('mouseout', (e) => {
// // // //        if (!e.target.closest('[data-tooltip]')) return;
// // // //        clearTimeout(showTid);
// // // //        tip.classList.remove('visible');
// // // //        tip.setAttribute('aria-hidden', 'true');
// // // //        hoverEl = null;
// // // //      });
// // // //    }

// // // //    function positionTooltip(tip, target) {
// // // //      const rect = target.getBoundingClientRect();
// // // //      const tipW = 200;
// // // //      let left = rect.left + rect.width / 2 - tipW / 2;
// // // //      let top = rect.top - 36;

// // // //      // Keep within viewport
// // // //      if (left < 6) left = 6;
// // // //      if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// // // //      if (top < 6) top = rect.bottom + 6;

// // // //      tip.style.left = left + 'px';
// // // //      tip.style.top = top + 'px';
// // // //      tip.style.width = tipW + 'px';
// // // //    }

// // // /* ═══════════════════════════════════════════════════════
// // //    Research Assistant — side_panel.js (FIXED DOWNLOAD)
// // //    Now uses background service worker for reliable downloads
// // //    ═══════════════════════════════════════════════════════ */

// // // 'use strict';

// // // let notes = [];
// // // let lastSummary = '';

// // // document.addEventListener('DOMContentLoaded', () => {
// // //     loadNotes();
// // //     bindButtons();
// // //     initTooltips();
// // // });

// // // function bindButtons() {
// // //     document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// // //     document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// // //     document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// // //     document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
// // //     document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// // //     document.getElementById('noteExportHTML').addEventListener('click', () => {
// // //         exportSingleNote(window._activeNoteId, 'html');
// // //     });
// // //     document.getElementById('noteExportDoc').addEventListener('click', () => {
// // //         exportSingleNote(window._activeNoteId, 'doc');
// // //     });
// // //     document.getElementById('noteExportModal').addEventListener('click', (e) => {
// // //         if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// // //     });

// // //     document.getElementById('exportBtn').addEventListener('click', openExportModal);
// // //     document.getElementById('closeExport').addEventListener('click', closeExportModal);
// // //     document.getElementById('exportHTML').addEventListener('click', () => exportNotes('pdf'));
// // //     document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// // //     document.getElementById('exportModal').addEventListener('click', (e) => {
// // //         if (e.target === document.getElementById('exportModal')) closeExportModal();
// // //     });
// // // }

// // // // ═══════════════════════════════════════════════════
// // // // FEATURE 1 — Summarise selected text
// // // // ═══════════════════════════════════════════════════
// // // async function summarizeSelection() {
// // //     try {
// // //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //         const [{ result: sel }] = await chrome.scripting.executeScript({
// // //             target: { tabId: tab.id },
// // //             function: () => window.getSelection().toString()
// // //         });

// // //         if (!sel || !sel.trim()) {
// // //             showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// // //             return;
// // //         }

// // //         showResult('Summarising…', false);
// // //         hideSavePromptBar();

// // //         const res = await fetch('http://localhost:8080/api/research/process', {
// // //             method: 'POST',
// // //             headers: { 'Content-Type': 'application/json' },
// // //             body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
// // //         });
// // //         if (!res.ok) throw new Error('API error ' + res.status);

// // //         lastSummary = (await res.text()).trim();
// // //         showResult(lastSummary, true);
// // //         showSavePromptBar();

// // //     } catch (err) {
// // //         showResult('❌ ' + err.message, false);
// // //         hideSavePromptBar();
// // //     }
// // // }

// // // // ═══════════════════════════════════════════════════
// // // // FEATURE 2 — Bookmark page or selection
// // // // ═══════════════════════════════════════════════════
// // // async function bookmarkPage() {
// // //     try {
// // //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //         const [{ result: sel }] = await chrome.scripting.executeScript({
// // //             target: { tabId: tab.id },
// // //             function: () => window.getSelection().toString()
// // //         });

// // //         const content = (sel || '').trim();

// // //         if (!content) {
// // //             const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// // //             saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// // //             toast('📌 Page bookmarked!');
// // //             return;
// // //         }

// // //         toast('Summarising & saving…');
// // //         const res = await fetch('http://localhost:8080/api/research/process', {
// // //             method: 'POST',
// // //             headers: { 'Content-Type': 'application/json' },
// // //             body: JSON.stringify({ content, operation: 'summarize' })
// // //         });
// // //         if (!res.ok) throw new Error('API error ' + res.status);

// // //         const summary = (await res.text()).trim();
// // //         saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// // //         toast('✅ Bookmarked & summarised!');

// // //     } catch (err) {
// // //         toast('❌ ' + err.message);
// // //     }
// // // }

// // // function saveSummaryAsNote() {
// // //     if (!lastSummary) return;
// // //     saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// // //     hideSavePromptBar();
// // //     toast('✅ Summary saved to notes!');
// // // }

// // // function saveManualNote() {
// // //     const el = document.getElementById('quickNoteInput');
// // //     const text = el.value.trim();
// // //     if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// // //     saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// // //     el.value = '';
// // //     toast('✅ Note saved!');
// // // }

// // // function saveNote({ title, content, type }) {
// // //     const note = {
// // //         id: 'n' + Date.now(),
// // //         title: title || 'Untitled',
// // //         content: content || '',
// // //         type: type || 'manual',
// // //         pinned: false,
// // //         expanded: false,
// // //         createdAt: new Date().toISOString()
// // //     };
// // //     notes.unshift(note);
// // //     persistNotes();
// // //     renderNotes();
// // // }

// // // function togglePin(id) {
// // //     const note = notes.find(n => n.id === id);
// // //     if (!note) return;
// // //     note.pinned = !note.pinned;
// // //     persistNotes();
// // //     renderNotes();
// // // }

// // // function editNoteTitle(id) {

// // //     // Find note
// // //     const note = notes.find(n => n.id === id);

// // //     if (!note) return;

// // //     // Ask user for new title
// // //     const newTitle = prompt(
// // //         'Enter new note title:',
// // //         note.title
// // //     );

// // //     // User pressed cancel
// // //     if (newTitle === null) return;

// // //     // Remove extra spaces
// // //     const cleanTitle = newTitle.trim();

// // //     // Prevent empty title
// // //     if (!cleanTitle) {
// // //         toast('⚠️ Title cannot be empty');
// // //         return;
// // //     }

// // //     // Update title
// // //     note.title = cleanTitle;

// // //     // Save to Chrome storage
// // //     persistNotes();

// // //     // Refresh UI
// // //     renderNotes();

// // //     toast('✅ Title updated!');
// // // }

// // // function deleteNote(id) {
// // //     const idx = notes.findIndex(n => n.id === id);
// // //     if (idx === -1) return;
// // //     notes.splice(idx, 1);
// // //     persistNotes();
// // //     renderNotes();
// // //     toast('🗑 Note deleted');
// // // }

// // // function toggleExpand(id) {
// // //     const note = notes.find(n => n.id === id);
// // //     if (!note) return;
// // //     note.expanded = !note.expanded;
// // //     const expandEl = document.getElementById('exp-' + id);
// // //     if (expandEl) expandEl.classList.toggle('open', note.expanded);

// // //     const titleBtn = document.getElementById('tbtn-' + id);
// // //     if (titleBtn) {
// // //         const chev = titleBtn.querySelector('.chev');
// // //         if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// // //     }
// // // }

// // // // ═══════════════════════════════════════════════════
// // // // EXPORT FUNCTIONS
// // // // ═══════════════════════════════════════════════════
// // // function openExportModal() {
// // //     if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// // //     document.getElementById('exportModal').classList.remove('hidden');
// // // }

// // // function closeExportModal() {
// // //     document.getElementById('exportModal').classList.add('hidden');
// // // }

// // // function exportNotes(format) {
// // //     closeExportModal();
// // //     if (format === 'html') {
// // //         exportAsHTML();
// // //     } else if (format === 'txt') {
// // //         exportAsDoc();
// // //     }
// // // }

// // // function exportAsHTML() {
// // //     const sorted = getSorted();
// // //     let rows = sorted.map(n => {
// // //         const date = formatDate(n.createdAt);
// // //         const safeTitle = escHTML(n.title);
// // //         const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// // //         const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // //         return `
// // //          <div class="note">
// // //            <div class="note-head">
// // //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// // //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// // //              <span class="date">${date}</span>
// // //            </div>
// // //            <h2>${safeTitle}</h2>
// // //            <p>${safeContent}</p>
// // //          </div>`;
// // //     }).join('');

// // //     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // //        <title>Research Notes Export</title>
// // //        <style>
// // //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// // //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// // //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// // //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px}
// // //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// // //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// // //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase}
// // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // //          .date{font-size:10px;color:#aaa;margin-left:auto}
// // //        </style>
// // //      </head><body>
// // //        <h1>Research Notes</h1>
// // //        <div class="meta">Exported ${new Date().toLocaleString()}</div>
// // //        ${rows}
// // //      </body></html>`;

// // //     downloadViaBlob(html, 'research-notes.html', 'text/html');
// // //     toast('📄 Downloading research-notes.html...');
// // // }

// // // function exportAsDoc() {
// // //     const sorted = getSorted();
// // //     const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// // //     sorted.forEach((n, i) => {
// // //         const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[n.type] || 'Note';
// // //         lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// // //         lines.push(n.title);
// // //         lines.push('');
// // //         lines.push(n.content);
// // //         lines.push('');
// // //     });

// // //     downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
// // //     toast('📝 Downloading research-notes.txt...');
// // // }

// // // function openNoteExportModal(id) {
// // //     const note = notes.find(n => n.id === id);
// // //     if (!note) return;
// // //     window._activeNoteId = id;
// // //     document.getElementById('noteExportTitle').textContent = note.title;
// // //     document.getElementById('noteExportModal').classList.remove('hidden');
// // // }

// // // function closeNoteExportModal() {
// // //     document.getElementById('noteExportModal').classList.add('hidden');
// // //     window._activeNoteId = null;
// // // }

// // // function exportSingleNote(id, format) {
// // //     closeNoteExportModal();
// // //     const note = notes.find(n => n.id === id);
// // //     if (!note) return;

// // //     if (format === 'html') {
// // //         exportSingleNoteAsHTML(note);
// // //     } else {
// // //         exportSingleNoteAsDoc(note);
// // //     }
// // // }

// // // function exportSingleNoteAsHTML(note) {
// // //     const date = formatDate(note.createdAt);
// // //     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // //     const safeTitle = escHTML(note.title);
// // //     const safeContent = escHTML(note.content).replace(/\n/g, '<br>');

// // //     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// // //        <title>${safeTitle}</title>
// // //        <style>
// // //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// // //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px}
// // //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase}
// // //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// // //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// // //          .badge-manual{background:#ebfbee;color:#2f9e44}
// // //          .date{font-size:11px;color:#8a90a8}
// // //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// // //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// // //        </style>
// // //      </head><body>
// // //        <div class="meta">
// // //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// // //          <span class="date">${date}</span>
// // //        </div>
// // //        <h1>${safeTitle}</h1>
// // //        <p>${safeContent}</p>
// // //      </body></html>`;

// // //     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// // //     downloadViaBlob(html, `note-${slug}.html`, 'text/html');
// // //     toast('📄 Downloading note...');
// // // }

// // // function exportSingleNoteAsDoc(note) {
// // //     const date = formatDate(note.createdAt);
// // //     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // //     const lines = [
// // //         note.title,
// // //         '='.repeat(Math.min(note.title.length, 60)),
// // //         `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// // //         `Date: ${date}`,
// // //         '',
// // //         note.content
// // //     ];

// // //     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// // //     downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
// // //     toast('📝 Downloading note...');
// // // }

// // // // ═══════════════════════════════════════════════════
// // // // FIXED DOWNLOAD FUNCTION
// // // // Uses background service worker for reliability
// // // // ═══════════════════════════════════════════════════
// // // function downloadViaBlob(content, filename, mimeType) {
// // //     // Send to background service worker which handles the download
// // //     chrome.runtime.sendMessage({
// // //         action: 'downloadFile',
// // //         content: content,
// // //         filename: filename,
// // //         mimeType: mimeType
// // //     }, (response) => {
// // //         if (chrome.runtime.lastError) {
// // //             console.error('Download error:', chrome.runtime.lastError.message);
// // //             toast('❌ Download error: ' + chrome.runtime.lastError.message);
// // //         }
// // //     });
// // // }

// // // // ═══════════════════════════════════════════════════
// // // // STORAGE & RENDERING
// // // // ═══════════════════════════════════════════════════
// // // function loadNotes() {
// // //     chrome.storage.local.get(['researchNotesV2'], (result) => {
// // //         notes = result.researchNotesV2 || [];
// // //         renderNotes();
// // //     });
// // // }

// // // function persistNotes() {
// // //     chrome.storage.local.set({ researchNotesV2: notes });
// // // }

// // // function renderNotes() {
// // //     const list = document.getElementById('notesList');
// // //     const countEl = document.getElementById('noteCount');
// // //     countEl.textContent = notes.length;

// // //     if (!notes.length) {
// // //         list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
// // //         return;
// // //     }

// // //     list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// // //     list.querySelectorAll('.note-card').forEach(card => {
// // //         const id = card.dataset.id;
// // //         const titleBtn = card.querySelector('.note-title-btn');
// // //         if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));
// // //         const dlBtn = card.querySelector('.dl-btn');
// // //         if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));
// // //         const pinBtn = card.querySelector('.pin-btn');
// // //         if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));
// // //         const editBtn = card.querySelector('.edit-btn');
// // //         if (editBtn) {
// // //             editBtn.addEventListener('click', () => editNoteTitle(id));
// // //         }
// // //         const delBtn = card.querySelector('.del-btn');
// // //         if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// // //     });
// // // }

// // // function buildCardHTML(note) {
// // //     const safeTitle = escHTML(note.title);
// // //     const safePreview = escHTML(truncate(note.content, 120));
// // //     const date = formatDate(note.createdAt);
// // //     const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note' }[note.type] || 'Note';
// // //     const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// // //     const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// // //     const expandOpen = note.expanded ? 'open' : '';
// // //     const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// // //     return `
// // //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// // //          <div class="note-card-top">
// // //            <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" aria-label="Toggle note: ${safeTitle}" data-tooltip="Click to read the full note">
// // //              <span class="note-title-text">${safeTitle}</span>
// // //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// // //            </button>
// // //            <div class="card-actions">
// // //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// // //              <button class="card-icon-btn edit-btn" data-tooltip="Edit note title" aria-label="Edit note title" title="Edit title">✏️</button>
// // //              <button class="card-icon-btn dl-btn" data-tooltip="Download this note as PDF or TXT" aria-label="Download note" title="Download note">
// // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
// // //              </button>
// // //              <button class="card-icon-btn del-btn" data-tooltip="Delete this note" aria-label="Delete note" title="Delete">
// // //                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
// // //              </button>
// // //            </div>
// // //          </div>
// // //          <div class="note-preview">${safePreview}</div>
// // //          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note content"></div>
// // //          <div class="note-footer">
// // //            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
// // //            <span class="note-date">${date}</span>
// // //            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
// // //          </div>
// // //        </div>`;
// // // }

// // // (function patchRender() {
// // //     const observer = new MutationObserver(() => {
// // //         document.querySelectorAll('.note-expand').forEach(el => {
// // //             const card = el.closest('.note-card');
// // //             if (!card) return;
// // //             const id = card.dataset.id;
// // //             if (!id || el._filled) return;
// // //             const note = notes.find(n => n.id === id);
// // //             if (!note) return;
// // //             el.textContent = note.content;
// // //             el._filled = true;
// // //         });
// // //     });
// // //     const list = document.getElementById('notesList');
// // //     if (list) observer.observe(list, { childList: true, subtree: false });
// // // })();

// // // // ═══════════════════════════════════════════════════
// // // // HELPERS
// // // // ═══════════════════════════════════════════════════
// // // function getSorted() {
// // //     return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
// // // }

// // // function autoTitle(text) {
// // //     const clean = text.replace(/\n/g, ' ').trim();
// // //     const words = clean.split(/\s+/).slice(0, 7).join(' ');
// // //     return clean.split(/\s+/).length > 7 ? words + '…' : words;
// // // }

// // // function truncate(text, maxLen) {
// // //     const flat = text.replace(/\n/g, ' ');
// // //     return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// // // }

// // // function escHTML(str) {
// // //     return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// // // }

// // // function formatDate(iso) {
// // //     const d = new Date(iso);
// // //     return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// // // }

// // // function showResult(text, isPlain) {
// // //     const box = document.getElementById('resultBox');
// // //     const content = document.getElementById('resultContent');
// // //     if (isPlain) {
// // //         content.textContent = text;
// // //     } else {
// // //         content.innerHTML = text;
// // //     }
// // //     box.classList.remove('hidden');
// // // }

// // // function showSavePromptBar() {
// // //     document.getElementById('savePromptBar').classList.remove('hidden');
// // // }

// // // function hideSavePromptBar() {
// // //     document.getElementById('savePromptBar').classList.add('hidden');
// // //     lastSummary = '';
// // // }

// // // function toast(msg) {
// // //     const el = document.getElementById('toast');
// // //     el.textContent = msg;
// // //     el.classList.add('show');
// // //     clearTimeout(el._tid);
// // //     el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// // // }

// // // function initTooltips() {
// // //     const tip = document.getElementById('tooltip');
// // //     let showTid = null;

// // //     document.addEventListener('mouseover', (e) => {
// // //         const target = e.target.closest('[data-tooltip]');
// // //         if (!target) return;
// // //         clearTimeout(showTid);
// // //         showTid = setTimeout(() => {
// // //             const msg = target.dataset.tooltip;
// // //             if (!msg) return;
// // //             tip.textContent = msg;
// // //             positionTooltip(tip, target);
// // //             tip.classList.add('visible');
// // //             tip.removeAttribute('aria-hidden');
// // //         }, 500);
// // //     });

// // //     document.addEventListener('mouseout', (e) => {
// // //         if (!e.target.closest('[data-tooltip]')) return;
// // //         clearTimeout(showTid);
// // //         tip.classList.remove('visible');
// // //         tip.setAttribute('aria-hidden', 'true');
// // //     });
// // // }

// // // function positionTooltip(tip, target) {
// // //     const rect = target.getBoundingClientRect();
// // //     const tipW = 200;
// // //     let left = rect.left + rect.width / 2 - tipW / 2;
// // //     let top = rect.top - 36;

// // //     if (left < 6) left = 6;
// // //     if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// // //     if (top < 6) top = rect.bottom + 6;

// // //     tip.style.left = left + 'px';
// // //     tip.style.top = top + 'px';
// // //     tip.style.width = tipW + 'px';
// // // }

// // 'use strict';

// // let notes = [];
// // let lastSummary = '';

// // // ═══════════════════════════════════════════════════════════════════
// // // NEW: CONVERSATION STATE MANAGEMENT
// // // WHY? Track the entire conversation so AI can remember context
// // // ═══════════════════════════════════════════════════════════════════
// // let currentConversation = {
// //     originalSelectedText: '',      // Original text user selected
// //     currentSummary: '',             // Latest summary from AI
// //     messages: [],                   // All Q&A history
// //     isActive: false                 // Is conversation happening?
// // };

// // document.addEventListener('DOMContentLoaded', () => {
// //     loadNotes();
// //     bindButtons();
// //     initTooltips();
// //     initChatInterface();  // NEW: Initialize chat features
// // });

// // function bindButtons() {
// //     document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
// //     document.getElementById('bookmarkButton').addEventListener('click', bookmarkPage);
// //     document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
// //     document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);

// //     // NEW: Chat-related buttons
// //     document.getElementById('chatSendBtn').addEventListener('click', sendFollowUpQuestion);
// //     document.getElementById('chatInput').addEventListener('keypress', (e) => {
// //         if (e.key === 'Enter' && !e.shiftKey) {
// //             e.preventDefault();
// //             sendFollowUpQuestion();
// //         }
// //     });
// //     document.getElementById('saveConversationBtn').addEventListener('click', saveConversationAsNote);

// //     document.getElementById('closeNoteExport').addEventListener('click', closeNoteExportModal);
// //     document.getElementById('noteExportHTML').addEventListener('click', () => {
// //         exportSingleNote(window._activeNoteId, 'html');
// //     });
// //     document.getElementById('noteExportDoc').addEventListener('click', () => {
// //         exportSingleNote(window._activeNoteId, 'doc');
// //     });
// //     document.getElementById('noteExportModal').addEventListener('click', (e) => {
// //         if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
// //     });

// //     document.getElementById('exportBtn').addEventListener('click', openExportModal);
// //     document.getElementById('closeExport').addEventListener('click', closeExportModal);
// //     document.getElementById('exportHTML').addEventListener('click', () => exportNotes('pdf'));
// //     document.getElementById('exportDoc').addEventListener('click', () => exportNotes('doc'));

// //     document.getElementById('exportModal').addEventListener('click', (e) => {
// //         if (e.target === document.getElementById('exportModal')) closeExportModal();
// //     });
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // NEW: Initialize Chat Interface
// // // WHY? Setup chat box and make it ready for questions
// // // ═══════════════════════════════════════════════════════════════════
// // function initChatInterface() {
// //     const chatBox = document.getElementById('chatBox');
// //     const chatInput = document.getElementById('chatInput');

// //     // Hide chat box initially (show only after summary)
// //     // WHY? No point showing chat if there's no summary to ask about
// //     chatBox.classList.add('hidden');
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // FEATURE 1 — Summarise selected text WITH WORD COUNT SUPPORT
// // // ═══════════════════════════════════════════════════════════════════
// // async function summarizeSelection() {
// //     try {
// //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //         const [{ result: sel }] = await chrome.scripting.executeScript({
// //             target: { tabId: tab.id },
// //             function: () => window.getSelection().toString()
// //         });

// //         if (!sel || !sel.trim()) {
// //             showResult('⚠️ Please select some text on the page first, then click Summarise.', false);
// //             hideChat();
// //             return;
// //         }

// //         showResult('Summarising…', false);
// //         hideSavePromptBar();
// //         hideChat();

// //         // NEW: Store original text for conversation context
// //         currentConversation.originalSelectedText = sel.trim();
// //         currentConversation.messages = [];  // Reset conversation
// //         currentConversation.isActive = false;

// //         const res = await fetch('http://localhost:8080/api/research/process', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({ 
// //                 content: sel.trim(), 
// //                 operation: 'summarize'
// //                 // WHY? Backend will automatically extract word count from content
// //                 // Example: "Summarize in 50 words" → backend extracts 50
// //             })
// //         });
// //         if (!res.ok) throw new Error('API error ' + res.status);

// //         lastSummary = (await res.text()).trim();

// //         // NEW: Store summary in conversation state
// //         currentConversation.currentSummary = lastSummary;
// //         currentConversation.isActive = true;

// //         showResult(lastSummary, true);
// //         showSavePromptBar();

// //         // NEW: Show chat interface for follow-up questions
// //         showChat();
// //         toast('✅ Summary ready! Ask follow-up questions below.');

// //     } catch (err) {
// //         showResult('❌ ' + err.message, false);
// //         hideSavePromptBar();
// //         hideChat();
// //     }
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // FEATURE 2 — Bookmark page or selection
// // // ═══════════════════════════════════════════════════════════════════
// // async function bookmarkPage() {
// //     try {
// //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// //         const [{ result: sel }] = await chrome.scripting.executeScript({
// //             target: { tabId: tab.id },
// //             function: () => window.getSelection().toString()
// //         });

// //         const content = (sel || '').trim();

// //         if (!content) {
// //             const text = 'Page: ' + tab.title + '\nURL: ' + tab.url;
// //             saveNote({ title: tab.title || 'Bookmarked page', content: text, type: 'bookmark' });
// //             toast('📌 Page bookmarked!');
// //             return;
// //         }

// //         toast('Summarising & saving…');
// //         const res = await fetch('http://localhost:8080/api/research/process', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({ content, operation: 'summarize' })
// //         });
// //         if (!res.ok) throw new Error('API error ' + res.status);

// //         const summary = (await res.text()).trim();
// //         saveNote({ title: autoTitle(summary), content: summary, type: 'bookmark' });
// //         toast('✅ Bookmarked & summarised!');

// //     } catch (err) {
// //         toast('❌ ' + err.message);
// //     }
// // }

// // function saveSummaryAsNote() {
// //     if (!lastSummary) return;
// //     saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
// //     hideSavePromptBar();
// //     toast('✅ Summary saved to notes!');
// // }

// // function saveManualNote() {
// //     const el = document.getElementById('quickNoteInput');
// //     const text = el.value.trim();
// //     if (!text) { toast('⚠️ Nothing to save — type a note first.'); return; }
// //     saveNote({ title: autoTitle(text), content: text, type: 'manual' });
// //     el.value = '';
// //     toast('✅ Note saved!');
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // NEW: Handle Follow-Up Questions
// // // WHY? Allow user to ask questions about the summary
// // // Similar to ChatGPT, Claude, Gemini
// // // ═══════════════════════════════════════════════════════════════════
// // async function sendFollowUpQuestion() {
// //     const chatInput = document.getElementById('chatInput');
// //     const question = chatInput.value.trim();

// //     if (!question) {
// //         toast('⚠️ Type a question first!');
// //         return;
// //     }

// //     if (!currentConversation.isActive) {
// //         toast('⚠️ Get a summary first before asking questions!');
// //         return;
// //     }

// //     // Add user's question to chat display
// //     addMessageToChat('user', question);

// //     // Add to conversation history for context
// //     currentConversation.messages.push({
// //         role: 'user',
// //         content: question
// //     });

// //     // Clear input
// //     chatInput.value = '';

// //     // Show loading indicator
// //     addMessageToChat('assistant', '⏳ Thinking...');

// //     try {
// //         // Send to backend
// //         const res = await fetch('http://localhost:8080/api/research/process', {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({
// //                 operation: 'followup',
// //                 question: question,
// //                 content: currentConversation.currentSummary,  // Latest summary
// //                 originalSelectedText: currentConversation.originalSelectedText,  // Original text for context
// //                 conversationHistory: currentConversation.messages.slice(0, -1)  // Previous messages (exclude current question)
// //             })
// //         });

// //         if (!res.ok) throw new Error('API error ' + res.status);

// //         const answer = (await res.text()).trim();

// //         // Remove "thinking" message and add real answer
// //         removeLastMessage();
// //         addMessageToChat('assistant', answer);

// //         // Add to conversation history
// //         currentConversation.messages.push({
// //             role: 'assistant',
// //             content: answer
// //         });

// //         // Auto-scroll to latest message
// //         scrollChatToBottom();

// //     } catch (err) {
// //         removeLastMessage();
// //         addMessageToChat('assistant', '❌ Error: ' + err.message);
// //     }
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // NEW: Save Entire Conversation as Note
// // // WHY? User might want to keep the whole Q&A session
// // // ═══════════════════════════════════════════════════════════════════
// // function saveConversationAsNote() {
// //     if (currentConversation.messages.length === 0) {
// //         toast('⚠️ No conversation to save!');
// //         return;
// //     }

// //     // Build conversation text
// //     let conversationText = 'ORIGINAL TEXT:\n';
// //     conversationText += currentConversation.originalSelectedText + '\n\n';
// //     conversationText += 'SUMMARY:\n';
// //     conversationText += currentConversation.currentSummary + '\n\n';
// //     conversationText += 'CONVERSATION:\n';
// //     conversationText += '─'.repeat(50) + '\n';

// //     currentConversation.messages.forEach((msg, idx) => {
// //         if (msg.role === 'user') {
// //             conversationText += `\n[Question ${idx + 1}]\n`;
// //             conversationText += msg.content + '\n';
// //         } else {
// //             conversationText += `\n[Answer]\n`;
// //             conversationText += msg.content + '\n';
// //         }
// //     });

// //     // Create a note
// //     saveNote({
// //         title: autoTitle(currentConversation.currentSummary) + ' (with Q&A)',
// //         content: conversationText,
// //         type: 'conversation'  // NEW: Special type for conversations
// //     });

// //     toast('✅ Conversation saved as note!');
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // HELPER FUNCTIONS: Chat UI Management
// // // ═══════════════════════════════════════════════════════════════════

// // function showChat() {
// //     const chatBox = document.getElementById('chatBox');
// //     chatBox.classList.remove('hidden');
// //     document.getElementById('saveConversationBtn').classList.remove('hidden');
// // }

// // function hideChat() {
// //     const chatBox = document.getElementById('chatBox');
// //     chatBox.classList.add('hidden');
// //     document.getElementById('saveConversationBtn').classList.add('hidden');
// // }

// // function addMessageToChat(role, content) {
// //     const chatMessages = document.getElementById('chatMessages');

// //     const messageEl = document.createElement('div');
// //     messageEl.className = `chat-message ${role}`;

// //     const badgeEl = document.createElement('span');
// //     badgeEl.className = `chat-badge badge-${role}`;
// //     badgeEl.textContent = role === 'user' ? 'You' : 'Assistant';

// //     const bubbleEl = document.createElement('div');
// //     bubbleEl.className = 'chat-bubble';
// //     bubbleEl.textContent = content;

// //     messageEl.appendChild(badgeEl);
// //     messageEl.appendChild(bubbleEl);

// //     chatMessages.appendChild(messageEl);
// // }

// // function removeLastMessage() {
// //     const chatMessages = document.getElementById('chatMessages');
// //     if (chatMessages.lastChild) {
// //         chatMessages.removeChild(chatMessages.lastChild);
// //     }
// // }

// // function scrollChatToBottom() {
// //     const chatMessages = document.getElementById('chatMessages');
// //     // WHY? Auto-scroll so user sees latest message
// //     setTimeout(() => {
// //         chatMessages.scrollTop = chatMessages.scrollHeight;
// //     }, 100);
// // }

// // function saveNote({ title, content, type }) {
// //     const note = {
// //         id: 'n' + Date.now(),
// //         title: title || 'Untitled',
// //         content: content || '',
// //         type: type || 'manual',
// //         pinned: false,
// //         expanded: false,
// //         createdAt: new Date().toISOString()
// //     };
// //     notes.unshift(note);
// //     persistNotes();
// //     renderNotes();
// // }

// // function togglePin(id) {
// //     const note = notes.find(n => n.id === id);
// //     if (!note) return;
// //     note.pinned = !note.pinned;
// //     persistNotes();
// //     renderNotes();
// // }

// // function editNoteTitle(id) {
// //     const note = notes.find(n => n.id === id);
// //     if (!note) return;

// //     const newTitle = prompt('Enter new note title:', note.title);
// //     if (newTitle === null) return;

// //     const cleanTitle = newTitle.trim();
// //     if (!cleanTitle) {
// //         toast('⚠️ Title cannot be empty');
// //         return;
// //     }

// //     note.title = cleanTitle;
// //     persistNotes();
// //     renderNotes();
// //     toast('✅ Title updated!');
// // }

// // function deleteNote(id) {
// //     const idx = notes.findIndex(n => n.id === id);
// //     if (idx === -1) return;
// //     notes.splice(idx, 1);
// //     persistNotes();
// //     renderNotes();
// //     toast('🗑 Note deleted');
// // }

// // function toggleExpand(id) {
// //     const note = notes.find(n => n.id === id);
// //     if (!note) return;
// //     note.expanded = !note.expanded;
// //     const expandEl = document.getElementById('exp-' + id);
// //     if (expandEl) expandEl.classList.toggle('open', note.expanded);

// //     const titleBtn = document.getElementById('tbtn-' + id);
// //     if (titleBtn) {
// //         const chev = titleBtn.querySelector('.chev');
// //         if (chev) chev.style.transform = note.expanded ? 'rotate(180deg)' : '';
// //     }
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // EXPORT FUNCTIONS
// // // ═══════════════════════════════════════════════════════════════════
// // function openExportModal() {
// //     if (!notes.length) { toast('⚠️ No notes to export yet.'); return; }
// //     document.getElementById('exportModal').classList.remove('hidden');
// // }

// // function closeExportModal() {
// //     document.getElementById('exportModal').classList.add('hidden');
// // }

// // function exportNotes(format) {
// //     closeExportModal();
// //     if (format === 'html') {
// //         exportAsHTML();
// //     } else if (format === 'txt') {
// //         exportAsDoc();
// //     }
// // }

// // function exportAsHTML() {
// //     const sorted = getSorted();
// //     let rows = sorted.map(n => {
// //         const date = formatDate(n.createdAt);
// //         const safeTitle = escHTML(n.title);
// //         const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
// //         const badgeLabel = { 
// //             summary: 'Summary', 
// //             bookmark: 'Bookmark', 
// //             manual: 'Note',
// //             conversation: 'Conversation'  // NEW
// //         }[n.type] || 'Note';
// //         return `
// //          <div class="note">
// //            <div class="note-head">
// //              <span class="badge badge-${n.type}">${badgeLabel}</span>
// //              ${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}
// //              <span class="date">${date}</span>
// //            </div>
// //            <h2>${safeTitle}</h2>
// //            <p>${safeContent}</p>
// //          </div>`;
// //     }).join('');

// //     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>Research Notes Export</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}
// //          h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}
// //          .meta{font-size:12px;color:#888;margin-bottom:28px}
// //          .note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px}
// //          h2{font-size:14px;margin-bottom:8px;color:#1a1d2e}
// //          p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}
// //          .badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .badge-conversation{background:#ffeedd;color:#d97706}
// //          .date{font-size:10px;color:#aaa;margin-left:auto}
// //        </style>
// //      </head><body>
// //        <h1>Research Notes</h1>
// //        <div class="meta">Exported ${new Date().toLocaleString()}</div>
// //        ${rows}
// //      </body></html>`;

// //     downloadViaBlob(html, 'research-notes.html', 'text/html');
// //     toast('📄 Downloading research-notes.html...');
// // }

// // function exportAsDoc() {
// //     const sorted = getSorted();
// //     const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
// //     sorted.forEach((n, i) => {
// //         const badgeLabel = { 
// //             summary: 'Summary', 
// //             bookmark: 'Bookmark', 
// //             manual: 'Note',
// //             conversation: 'Conversation'  // NEW
// //         }[n.type] || 'Note';
// //         lines.push(`--- Note ${i + 1} [${badgeLabel}${n.pinned ? ' · Pinned' : ''}] ${formatDate(n.createdAt)} ---`);
// //         lines.push(n.title);
// //         lines.push('');
// //         lines.push(n.content);
// //         lines.push('');
// //     });

// //     downloadViaBlob(lines.join('\n'), 'research-notes.txt', 'text/plain');
// //     toast('📝 Downloading research-notes.txt...');
// // }

// // function openNoteExportModal(id) {
// //     const note = notes.find(n => n.id === id);
// //     if (!note) return;
// //     window._activeNoteId = id;
// //     document.getElementById('noteExportTitle').textContent = note.title;
// //     document.getElementById('noteExportModal').classList.remove('hidden');
// // }

// // function closeNoteExportModal() {
// //     document.getElementById('noteExportModal').classList.add('hidden');
// //     window._activeNoteId = null;
// // }

// // function exportSingleNote(id, format) {
// //     closeNoteExportModal();
// //     const note = notes.find(n => n.id === id);
// //     if (!note) return;

// //     if (format === 'html') {
// //         exportSingleNoteAsHTML(note);
// //     } else {
// //         exportSingleNoteAsDoc(note);
// //     }
// // }

// // function exportSingleNoteAsHTML(note) {
// //     const date = formatDate(note.createdAt);
// //     const badgeLabel = { 
// //         summary: 'Summary', 
// //         bookmark: 'Bookmark', 
// //         manual: 'Note',
// //         conversation: 'Conversation'  // NEW
// //     }[note.type] || 'Note';
// //     const safeTitle = escHTML(note.title);
// //     const safeContent = escHTML(note.content).replace(/\n/g, '<br>');

// //     const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
// //        <title>${safeTitle}</title>
// //        <style>
// //          body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1d2e;max-width:680px;margin:auto}
// //          .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px}
// //          .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase}
// //          .badge-summary{background:#eef1ff;color:#2f4ac5}
// //          .badge-bookmark{background:#f3f0ff;color:#7048e8}
// //          .badge-manual{background:#ebfbee;color:#2f9e44}
// //          .badge-conversation{background:#ffeedd;color:#d97706}
// //          .date{font-size:11px;color:#8a90a8}
// //          h1{font-size:20px;margin-bottom:18px;color:#1a1d2e;border-bottom:2px solid #e4e7f0;padding-bottom:10px}
// //          p{font-size:13px;line-height:1.8;color:#4a5068;white-space:pre-wrap}
// //        </style>
// //      </head><body>
// //        <div class="meta">
// //          <span class="badge badge-${note.type}">${badgeLabel}</span>
// //          <span class="date">${date}</span>
// //        </div>
// //        <h1>${safeTitle}</h1>
// //        <p>${safeContent}</p>
// //      </body></html>`;

// //     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// //     downloadViaBlob(html, `note-${slug}.html`, 'text/html');
// //     toast('📄 Downloading note...');
// // }

// // function exportSingleNoteAsDoc(note) {
// //     const date = formatDate(note.createdAt);
// //     const badgeLabel = { 
// //         summary: 'Summary', 
// //         bookmark: 'Bookmark', 
// //         manual: 'Note',
// //         conversation: 'Conversation'  // NEW
// //     }[note.type] || 'Note';
// //     const lines = [
// //         note.title,
// //         '='.repeat(Math.min(note.title.length, 60)),
// //         `Type: ${badgeLabel}${note.pinned ? '  ·  📌 Pinned' : ''}`,
// //         `Date: ${date}`,
// //         '',
// //         note.content
// //     ];

// //     const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
// //     downloadViaBlob(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
// //     toast('📝 Downloading note...');
// // }

// // function downloadViaBlob(content, filename, mimeType) {
// //     chrome.runtime.sendMessage({
// //         action: 'downloadFile',
// //         content: content,
// //         filename: filename,
// //         mimeType: mimeType
// //     }, (response) => {
// //         if (chrome.runtime.lastError) {
// //             console.error('Download error:', chrome.runtime.lastError.message);
// //             toast('❌ Download error: ' + chrome.runtime.lastError.message);
// //         }
// //     });
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // STORAGE & RENDERING
// // // ═══════════════════════════════════════════════════════════════════
// // function loadNotes() {
// //     chrome.storage.local.get(['researchNotesV2'], (result) => {
// //         notes = result.researchNotesV2 || [];
// //         renderNotes();
// //     });
// // }

// // function persistNotes() {
// //     chrome.storage.local.set({ researchNotesV2: notes });
// // }

// // function renderNotes() {
// //     const list = document.getElementById('notesList');
// //     const countEl = document.getElementById('noteCount');
// //     countEl.textContent = notes.length;

// //     if (!notes.length) {
// //         list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
// //         return;
// //     }

// //     list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');

// //     list.querySelectorAll('.note-card').forEach(card => {
// //         const id = card.dataset.id;
// //         const titleBtn = card.querySelector('.note-title-btn');
// //         if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));
// //         const dlBtn = card.querySelector('.dl-btn');
// //         if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));
// //         const pinBtn = card.querySelector('.pin-btn');
// //         if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));
// //         const editBtn = card.querySelector('.edit-btn');
// //         if (editBtn) {
// //             editBtn.addEventListener('click', () => editNoteTitle(id));
// //         }
// //         const delBtn = card.querySelector('.del-btn');
// //         if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
// //     });
// // }

// // function buildCardHTML(note) {
// //     const safeTitle = escHTML(note.title);
// //     const safePreview = escHTML(truncate(note.content, 120));
// //     const date = formatDate(note.createdAt);
// //     const badgeLabel = { 
// //         summary: 'Summary', 
// //         bookmark: 'Bookmark', 
// //         manual: 'Note',
// //         conversation: 'Conversation'  // NEW
// //     }[note.type] || 'Note';
// //     const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
// //     const pinTitle = note.pinned ? 'Unpin this note' : 'Pin to top';
// //     const expandOpen = note.expanded ? 'open' : '';
// //     const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

// //     return `
// //        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
// //          <div class="note-card-top">
// //            <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" aria-label="Toggle note: ${safeTitle}" data-tooltip="Click to read the full note">
// //              <span class="note-title-text">${safeTitle}</span>
// //              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
// //            </button>
// //            <div class="card-actions">
// //              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" aria-label="${pinTitle}" title="${pinTitle}">📌</button>
// //              <button class="card-icon-btn edit-btn" data-tooltip="Edit note title" aria-label="Edit note title" title="Edit title">✏️</button>
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
// // }

// // (function patchRender() {
// //     const observer = new MutationObserver(() => {
// //         document.querySelectorAll('.note-expand').forEach(el => {
// //             const card = el.closest('.note-card');
// //             if (!card) return;
// //             const id = card.dataset.id;
// //             if (!id || el._filled) return;
// //             const note = notes.find(n => n.id === id);
// //             if (!note) return;
// //             el.textContent = note.content;
// //             el._filled = true;
// //         });
// //     });
// //     const list = document.getElementById('notesList');
// //     if (list) observer.observe(list, { childList: true, subtree: false });
// // })();

// // // ═══════════════════════════════════════════════════════════════════
// // // HELPERS
// // // ═══════════════════════════════════════════════════════════════════
// // function getSorted() {
// //     return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
// // }

// // function autoTitle(text) {
// //     const clean = text.replace(/\n/g, ' ').trim();
// //     const words = clean.split(/\s+/).slice(0, 7).join(' ');
// //     return clean.split(/\s+/).length > 7 ? words + '…' : words;
// // }

// // function truncate(text, maxLen) {
// //     const flat = text.replace(/\n/g, ' ');
// //     return flat.length > maxLen ? flat.slice(0, maxLen) + '…' : flat;
// // }

// // function escHTML(str) {
// //     return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// // }

// // function formatDate(iso) {
// //     const d = new Date(iso);
// //     return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
// // }

// // function showResult(text, isPlain) {
// //     const box = document.getElementById('resultBox');
// //     const content = document.getElementById('resultContent');
// //     if (isPlain) {
// //         content.textContent = text;
// //     } else {
// //         content.innerHTML = text;
// //     }
// //     box.classList.remove('hidden');
// // }

// // function showSavePromptBar() {
// //     document.getElementById('savePromptBar').classList.remove('hidden');
// // }

// // function hideSavePromptBar() {
// //     document.getElementById('savePromptBar').classList.add('hidden');
// //     lastSummary = '';
// // }

// // function toast(msg) {
// //     const el = document.getElementById('toast');
// //     el.textContent = msg;
// //     el.classList.add('show');
// //     clearTimeout(el._tid);
// //     el._tid = setTimeout(() => el.classList.remove('show'), 2400);
// // }

// // function initTooltips() {
// //     const tip = document.getElementById('tooltip');
// //     let showTid = null;

// //     document.addEventListener('mouseover', (e) => {
// //         const target = e.target.closest('[data-tooltip]');
// //         if (!target) return;
// //         clearTimeout(showTid);
// //         showTid = setTimeout(() => {
// //             const msg = target.dataset.tooltip;
// //             if (!msg) return;
// //             tip.textContent = msg;
// //             positionTooltip(tip, target);
// //             tip.classList.add('visible');
// //             tip.removeAttribute('aria-hidden');
// //         }, 500);
// //     });

// //     document.addEventListener('mouseout', (e) => {
// //         if (!e.target.closest('[data-tooltip]')) return;
// //         clearTimeout(showTid);
// //         tip.classList.remove('visible');
// //         tip.setAttribute('aria-hidden', 'true');
// //     });
// // }

// // function positionTooltip(tip, target) {
// //     const rect = target.getBoundingClientRect();
// //     const tipW = 200;
// //     let left = rect.left + rect.width / 2 - tipW / 2;
// //     let top = rect.top - 36;

// //     if (left < 6) left = 6;
// //     if (left + tipW > window.innerWidth - 6) left = window.innerWidth - tipW - 6;
// //     if (top < 6) top = rect.bottom + 6;

// //     tip.style.left = left + 'px';
// //     tip.style.top = top + 'px';
// //     tip.style.width = tipW + 'px';
// // }


// 'use strict';

// // ═══════════════════════════════════════════════════════════════════
// // DATA STRUCTURES
// // ═══════════════════════════════════════════════════════════════════
// let notes = [];
// let bookmarks = [];              // NEW: Store page bookmarks
// let sectionBookmarks = [];       // NEW: Store section bookmarks
// let lastSummary = '';
// let currentCitation = null;      // NEW: Current citation being edited

// // Conversation state (from previous implementation)
// let currentConversation = {
//     originalSelectedText: '',
//     currentSummary: '',
//     messages: [],
//     isActive: false
// };

// // ═══════════════════════════════════════════════════════════════════
// // CITATION STYLES REFERENCE
// // ═══════════════════════════════════════════════════════════════════
// const CITATION_STYLES = {
//     apa: {
//         name: 'APA 7th Edition',
//         journal: (data) => `${data.authors.join(', ')} (${data.year}). ${data.title}. ${data.journal}, ${data.volume}${data.issue ? `(${data.issue})` : ''}, ${data.pages}. https://doi.org/${data.doi || 'xxx'}`,
//         book: (data) => `${data.authors.join(', ')} (${data.year}). ${data.title}. ${data.publisher}.`,
//         website: (data) => `${data.authors[0]} (${data.year}). ${data.title}. Retrieved from ${data.url}`,
//         thesis: (data) => `${data.authors.join(', ')} (${data.year}). ${data.title} [Doctoral dissertation, ${data.university}].`,
//         conference: (data) => `${data.authors.join(', ')} (${data.year}). ${data.title}. In ${data.conference} (pp. ${data.pages}).`,
//     },
//     ieee: {
//         name: 'IEEE',
//         journal: (data) => `[${data.authors[0]?.split(' ').pop() || 'Author'}] "${data.title}," ${data.journal}, vol. ${data.volume}${data.issue ? `, no. ${data.issue}` : ''}, pp. ${data.pages}, ${data.year}.`,
//         book: (data) => `[${data.authors[0]?.split(' ').pop() || 'Author'}] ${data.title}. ${data.publisher}, ${data.year}.`,
//         website: (data) => `[Online]. Available: ${data.url}. [Accessed: ${new Date().toLocaleDateString()}].`,
//         thesis: (data) => `[${data.authors[0]?.split(' ').pop() || 'Author'}] "${data.title}," Ph.D. dissertation, ${data.university}, ${data.year}.`,
//         conference: (data) => `[${data.authors[0]?.split(' ').pop() || 'Author'}] "${data.title}," in Proc. ${data.conference}, ${data.year}, pp. ${data.pages}.`,
//     },
//     chicago: {
//         name: 'Chicago/Turabian 17th Edition',
//         journal: (data) => `${data.authors.join(', ')}. "${data.title}." ${data.journal} ${data.volume}, no. ${data.issue} (${data.year}): ${data.pages}.`,
//         book: (data) => `${data.authors.join(', ')}. ${data.title}. ${data.publisher}, ${data.year}.`,
//         website: (data) => `"${data.title}." Accessed ${new Date().toLocaleDateString()}. ${data.url}.`,
//         thesis: (data) => `${data.authors.join(', ')}. "${data.title}." PhD diss., ${data.university}, ${data.year}.`,
//         conference: (data) => `${data.authors.join(', ')}. "${data.title}." In ${data.conference}, ${data.year}.`,
//     },
//     mla: {
//         name: 'MLA 9th Edition',
//         journal: (data) => `${data.authors.join(', ')}. "${data.title}." ${data.journal}, vol. ${data.volume}, no. ${data.issue}, ${data.year}, pp. ${data.pages}.`,
//         book: (data) => `${data.authors.join(', ')}. ${data.title}. ${data.publisher}, ${data.year}.`,
//         website: (data) => `${data.authors[0] || 'Author'}. "${data.title}." Web. Accessed ${new Date().toLocaleDateString()}.`,
//         thesis: (data) => `${data.authors.join(', ')}. "${data.title}." University of ${data.university}, ${data.year}. Dissertation.`,
//         conference: (data) => `${data.authors.join(', ')}. "${data.title}." ${data.conference}, ${data.year}.`,
//     },
//     harvard: {
//         name: 'Harvard',
//         journal: (data) => `${data.authors.join(', ')}, ${data.year}. ${data.title}. ${data.journal}, ${data.volume}(${data.issue}), pp.${data.pages}.`,
//         book: (data) => `${data.authors.join(', ')}, ${data.year}. ${data.title}. ${data.publisher}.`,
//         website: (data) => `${data.authors[0] || 'Author'}, ${data.year}. ${data.title}. Available at: ${data.url}`,
//         thesis: (data) => `${data.authors.join(', ')}, ${data.year}. ${data.title}. ${data.university}.`,
//         conference: (data) => `${data.authors.join(', ')}, ${data.year}. ${data.title}. In: ${data.conference}.`,
//     }
// };

// // Citation field templates by source type
// const CITATION_FIELDS = {
//     journal: [
//         { name: 'authors', label: 'Authors (comma-separated)', type: 'text', required: true },
//         { name: 'title', label: 'Article Title', type: 'text', required: true },
//         { name: 'journal', label: 'Journal Name', type: 'text', required: true },
//         { name: 'year', label: 'Year', type: 'number', required: true },
//         { name: 'volume', label: 'Volume', type: 'number', required: true },
//         { name: 'issue', label: 'Issue', type: 'number', required: false },
//         { name: 'pages', label: 'Pages', type: 'text', required: false },
//         { name: 'doi', label: 'DOI', type: 'text', required: false },
//     ],
//     book: [
//         { name: 'authors', label: 'Author(s)', type: 'text', required: true },
//         { name: 'title', label: 'Book Title', type: 'text', required: true },
//         { name: 'publisher', label: 'Publisher', type: 'text', required: true },
//         { name: 'year', label: 'Year Published', type: 'number', required: true },
//     ],
//     website: [
//         { name: 'authors', label: 'Website/Organization', type: 'text', required: true },
//         { name: 'title', label: 'Page Title', type: 'text', required: true },
//         { name: 'url', label: 'URL', type: 'url', required: true },
//         { name: 'year', label: 'Year Accessed', type: 'number', required: true },
//     ],
//     thesis: [
//         { name: 'authors', label: 'Author', type: 'text', required: true },
//         { name: 'title', label: 'Thesis Title', type: 'text', required: true },
//         { name: 'university', label: 'University', type: 'text', required: true },
//         { name: 'year', label: 'Year', type: 'number', required: true },
//     ],
//     conference: [
//         { name: 'authors', label: 'Author(s)', type: 'text', required: true },
//         { name: 'title', label: 'Paper Title', type: 'text', required: true },
//         { name: 'conference', label: 'Conference Name', type: 'text', required: true },
//         { name: 'year', label: 'Year', type: 'number', required: true },
//         { name: 'pages', label: 'Pages', type: 'text', required: false },
//     ],
//     report: [
//         { name: 'authors', label: 'Author/Organization', type: 'text', required: true },
//         { name: 'title', label: 'Report Title', type: 'text', required: true },
//         { name: 'publisher', label: 'Publisher/Organization', type: 'text', required: true },
//         { name: 'year', label: 'Year', type: 'number', required: true },
//     ],
//     preprint: [
//         { name: 'authors', label: 'Author(s)', type: 'text', required: true },
//         { name: 'title', label: 'Preprint Title', type: 'text', required: true },
//         { name: 'server', label: 'Preprint Server (arXiv, bioRxiv, etc.)', type: 'text', required: false },
//         { name: 'year', label: 'Year', type: 'number', required: true },
//         { name: 'url', label: 'URL', type: 'url', required: false },
//     ]
// };

// // ═══════════════════════════════════════════════════════════════════
// // INITIALIZATION
// // ═══════════════════════════════════════════════════════════════════
// document.addEventListener('DOMContentLoaded', () => {
//     loadNotes();
//     loadBookmarks();              // NEW: Load bookmarks
//     bindButtons();
//     initTooltips();
//     initCitationModal();          // NEW: Initialize citation system
//     initBookmarkModals();         // NEW: Initialize bookmark modals
// });

// function bindButtons() {
//     // Existing buttons
//     document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
//     document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
//     document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
//     document.getElementById('chatSendBtn').addEventListener('click', sendFollowUpQuestion);
//     document.getElementById('chatInput').addEventListener('keypress', (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             sendFollowUpQuestion();
//         }
//     });
//     document.getElementById('saveConversationBtn').addEventListener('click', saveConversationAsNote);
//     document.getElementById('exportBtn').addEventListener('click', openExportModal);

//     // NEW: Bookmark buttons
//     document.getElementById('bookmarkPageBtn').addEventListener('click', openBookmarkPageModal);
//     document.getElementById('bookmarkHeadingBtn').addEventListener('click', openBookmarkHeadingModal);

//     // NEW: Citation button
//     document.getElementById('citationBtn').addEventListener('click', openCitationModal);
// }

// // ═══════════════════════════════════════════════════════════════════
// // NEW: BOOKMARK SYSTEM
// // ═══════════════════════════════════════════════════════════════════

// async function openBookmarkPageModal() {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     const modal = document.getElementById('bookmarkModal');
//     modal.dataset.url = tab.url;
//     modal.dataset.title = tab.title;
//     document.getElementById('bookmarkName').value = '';
//     modal.classList.remove('hidden');
// }

// function closeBookmarkPageModal() {
//     document.getElementById('bookmarkModal').classList.add('hidden');
// }

// async function confirmBookmark() {
//     const modal = document.getElementById('bookmarkModal');
//     const customName = document.getElementById('bookmarkName').value.trim();
//     const url = modal.dataset.url;
//     const title = modal.dataset.title;

//     const bookmark = {
//         id: 'bm' + Date.now(),
//         name: customName || title,
//         url: url,
//         createdAt: new Date().toISOString(),
//         visitCount: 0,
//         lastVisited: null
//     };

//     bookmarks.unshift(bookmark);
//     persistBookmarks();
//     renderBookmarks();
//     closeBookmarkPageModal();
//     toast('🔖 Page bookmarked!');
// }

// function deleteBookmark(id) {
//     const idx = bookmarks.findIndex(b => b.id === id);
//     if (idx > -1) {
//         bookmarks.splice(idx, 1);
//         persistBookmarks();
//         renderBookmarks();
//         toast('🗑 Bookmark deleted');
//     }
// }

// async function openBookmarkedPage(url) {
//     // Track visit
//     const bookmark = bookmarks.find(b => b.url === url);
//     if (bookmark) {
//         bookmark.visitCount++;
//         bookmark.lastVisited = new Date().toISOString();
//         persistBookmarks();
//         renderBookmarks();
//     }

//     // Open in new tab
//     chrome.tabs.create({ url: url });
// }

// function renderBookmarks() {
//     const list = document.getElementById('bookmarksList');
//     const count = document.getElementById('bookmarkCount');

//     count.textContent = bookmarks.length;

//     if (!bookmarks.length) {
//         list.innerHTML = '<div class="bookmarks-list empty" data-empty="📂">No bookmarks yet</div>';
//         return;
//     }

//     list.innerHTML = bookmarks.map(bm => `
//         <div class="bookmark-item">
//             <span class="bookmark-icon">🔖</span>
//             <div class="bookmark-info">
//                 <div class="bookmark-name" onclick="openBookmarkedPage('${bm.url.replace(/'/g, "\\'")}')">${escHTML(bm.name)}</div>
//                 <div class="bookmark-meta">${new Date(bm.createdAt).toLocaleDateString()} • Visited ${bm.visitCount} times</div>
//             </div>
//             <div class="bookmark-actions">
//                 <button class="bookmark-btn delete" onclick="deleteBookmark('${bm.id}')" title="Delete">🗑️</button>
//             </div>
//         </div>
//     `).join('');
// }

// // ═══════════════════════════════════════════════════════════════════
// // NEW: SECTION BOOKMARK SYSTEM
// // ═══════════════════════════════════════════════════════════════════

// async function openBookmarkHeadingModal() {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     // Try to get selected heading text
//     const [{ result: selectedText }] = await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: () => {
//             const selection = window.getSelection();
//             if (selection.toString()) return selection.toString();

//             // Try to find nearest heading
//             const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
//             for (let heading of headings) {
//                 const range = document.createRange();
//                 range.selectNodeContents(heading);
//                 if (range.toString().toLowerCase().includes(selection.toString().toLowerCase())) {
//                     return range.toString();
//                 }
//             }
//             return '';
//         }
//     });

//     const modal = document.getElementById('bookmarkHeadingModal');
//     modal.dataset.pageUrl = tab.url;
//     const input = document.getElementById('headingName');
//     input.value = selectedText || '';
//     input.focus();
//     modal.classList.remove('hidden');
// }

// function closeBookmarkHeadingModal() {
//     document.getElementById('bookmarkHeadingModal').classList.add('hidden');
// }

// function confirmHeadingBookmark() {
//     const modal = document.getElementById('bookmarkHeadingModal');
//     const name = document.getElementById('headingName').value.trim();
//     const pageUrl = modal.dataset.pageUrl;

//     if (!name) {
//         toast('⚠️ Please enter a section name');
//         return;
//     }

//     const bookmark = {
//         id: 'sec' + Date.now(),
//         name: name,
//         pageUrl: pageUrl,
//         createdAt: new Date().toISOString()
//     };

//     sectionBookmarks.unshift(bookmark);
//     persistBookmarks();
//     renderSectionBookmarks();
//     closeBookmarkHeadingModal();
//     toast('📌 Section bookmarked!');
// }

// function deleteSectionBookmark(id) {
//     const idx = sectionBookmarks.findIndex(b => b.id === id);
//     if (idx > -1) {
//         sectionBookmarks.splice(idx, 1);
//         persistBookmarks();
//         renderSectionBookmarks();
//         toast('🗑 Section bookmark deleted');
//     }
// }

// async function openSectionBookmark(pageUrl, sectionName) {
//     // Open page and scroll to section (approximate)
//     chrome.tabs.create({ url: pageUrl });
//     toast('📌 Opening section: ' + sectionName);
// }

// function renderSectionBookmarks() {
//     const list = document.getElementById('sectionBookmarksList');
//     const count = document.getElementById('sectionCount');

//     count.textContent = sectionBookmarks.length;

//     if (!sectionBookmarks.length) {
//         list.innerHTML = '<div class="bookmarks-list empty" data-empty="📑">No section bookmarks yet</div>';
//         return;
//     }

//     list.innerHTML = sectionBookmarks.map(bm => `
//         <div class="bookmark-item">
//             <span class="bookmark-icon">📌</span>
//             <div class="bookmark-info">
//                 <div class="bookmark-name" onclick="openSectionBookmark('${bm.pageUrl.replace(/'/g, "\\'")}',' ${escHTML(bm.name).replace(/'/g, "\\'")}')">${escHTML(bm.name)}</div>
//                 <div class="bookmark-meta">${new Date(bm.createdAt).toLocaleDateString()}</div>
//             </div>
//             <div class="bookmark-actions">
//                 <button class="bookmark-btn delete" onclick="deleteSectionBookmark('${bm.id}')" title="Delete">🗑️</button>
//             </div>
//         </div>
//     `).join('');
// }

// function initBookmarkModals() {
//     document.getElementById('closeBookmarkModal').addEventListener('click', closeBookmarkPageModal);
//     document.getElementById('confirmBookmark').addEventListener('click', confirmBookmark);
//     document.getElementById('cancelBookmark').addEventListener('click', closeBookmarkPageModal);
//     document.getElementById('bookmarkModal').addEventListener('click', (e) => {
//         if (e.target === document.getElementById('bookmarkModal')) closeBookmarkPageModal();
//     });

//     document.getElementById('closeHeadingModal').addEventListener('click', closeBookmarkHeadingModal);
//     document.getElementById('confirmHeadingBookmark').addEventListener('click', confirmHeadingBookmark);
//     document.getElementById('cancelHeadingBookmark').addEventListener('click', closeBookmarkHeadingModal);
//     document.getElementById('bookmarkHeadingModal').addEventListener('click', (e) => {
//         if (e.target === document.getElementById('bookmarkHeadingModal')) closeBookmarkHeadingModal();
//     });
// }

// // ═══════════════════════════════════════════════════════════════════
// // NEW: CITATION SYSTEM
// // ═══════════════════════════════════════════════════════════════════

// function initCitationModal() {
//     document.getElementById('closeCitationModal').addEventListener('click', closeCitationModal);
//     document.getElementById('cancelCitation').addEventListener('click', closeCitationModal);
//     document.getElementById('generateCitation').addEventListener('click', generateCitation);

//     // Export buttons
//     document.getElementById('copyCitation').addEventListener('click', copyCitationToClipboard);
//     document.getElementById('downloadBib').addEventListener('click', downloadCitationAsBib);
//     document.getElementById('downloadCsv').addEventListener('click', downloadCitationAsCsv);
//     document.getElementById('downloadTxt').addEventListener('click', downloadCitationAsTxt);

//     // Style search
//     document.getElementById('styleSearch').addEventListener('input', (e) => {
//         const query = e.target.value.toLowerCase();
//         const styleSelect = document.getElementById('citationStyle');
//         const options = styleSelect.querySelectorAll('option');

//         if (query) {
//             options.forEach(opt => {
//                 opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
//             });
//         } else {
//             options.forEach(opt => opt.style.display = '');
//         }
//     });

//     // Close on backdrop click
//     document.getElementById('citationModal').addEventListener('click', (e) => {
//         if (e.target === document.getElementById('citationModal')) closeCitationModal();
//     });
// }

// function openCitationModal() {
//     document.getElementById('citationModal').classList.remove('hidden');
//     updateCitationFields();

//     // Try to auto-detect metadata from page
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         const tab = tabs[0];
//         autoDetectCitationMetadata(tab.url, tab.title);
//     });
// }

// function closeCitationModal() {
//     document.getElementById('citationModal').classList.add('hidden');
//     document.getElementById('citationPreviewSection').classList.add('hidden');
// }

// function updateCitationFields() {
//     const sourceType = document.getElementById('sourceType').value;
//     const fields = CITATION_FIELDS[sourceType] || [];
//     const container = document.getElementById('citationFields');

//     container.innerHTML = fields.map(field => `
//         <div class="form-group">
//             <label for="field_${field.name}">
//                 ${field.label}${field.required ? ' *' : ''}
//             </label>
//             <input 
//                 type="${field.type}" 
//                 id="field_${field.name}" 
//                 class="form-input" 
//                 placeholder="${field.label}"
//                 data-field="${field.name}"
//                 ${field.required ? 'required' : ''}
//             >
//         </div>
//     `).join('');
// }

// function autoDetectCitationMetadata(url, title) {
//     // Get metadata from page
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         const tab = tabs[0];
//         chrome.scripting.executeScript({
//             target: {tabId: tab.id},
//             function: extractMetadata
//         }, (results) => {
//             if (results && results[0]) {
//                 const metadata = results[0].result;

//                 // Auto-fill fields based on source type
//                 const sourceType = document.getElementById('sourceType').value;

//                 if (sourceType === 'website') {
//                     document.getElementById('field_url').value = url;
//                     document.getElementById('field_title').value = metadata.title || title;
//                     document.getElementById('field_authors').value = metadata.author || 'Author Unknown';
//                     document.getElementById('field_year').value = new Date().getFullYear();
//                 }
//             }
//         });
//     });
// }

// function extractMetadata() {
//     // This runs in page context to extract metadata
//     const metadata = {
//         title: document.querySelector('meta[name="og:title"]')?.content || document.title,
//         author: document.querySelector('meta[name="author"]')?.content || document.querySelector('meta[name="article:author"]')?.content || '',
//         doi: document.querySelector('meta[name="DOI"]')?.content || '',
//         date: document.querySelector('meta[name="article:published_time"]')?.content || document.querySelector('meta[name="date"]')?.content || ''
//     };
//     return metadata;
// }

// function generateCitation() {
//     const sourceType = document.getElementById('sourceType').value;
//     const citationStyle = document.getElementById('citationStyle').value;

//     // Collect form data
//     const data = {};
//     document.querySelectorAll('#citationFields input').forEach(input => {
//         const fieldName = input.dataset.field;
//         const value = input.value.trim();

//         if (fieldName === 'authors') {
//             data[fieldName] = value.split(',').map(a => a.trim());
//         } else {
//             data[fieldName] = value;
//         }
//     });

//     // Validate required fields
//     const fields = CITATION_FIELDS[sourceType];
//     for (let field of fields) {
//         if (field.required && (!data[field.name] || data[field.name] === '')) {
//             toast(`⚠️ Please fill in: ${field.label}`);
//             return;
//         }
//     }

//     // Generate citation
//     const styleGenerators = CITATION_STYLES[citationStyle] || CITATION_STYLES.apa;
//     const generator = styleGenerators[sourceType] || styleGenerators.journal;

//     try {
//         const citation = generator(data);
//         currentCitation = {
//             citation: citation,
//             data: data,
//             sourceType: sourceType,
//             style: citationStyle
//         };

//         // Show preview
//         document.getElementById('citationPreview').textContent = citation;
//         document.getElementById('citationPreviewSection').classList.remove('hidden');
//         toast('✅ Citation generated!');

//     } catch (err) {
//         toast('❌ Error generating citation: ' + err.message);
//     }
// }

// function copyCitationToClipboard() {
//     if (!currentCitation) {
//         toast('⚠️ No citation to copy');
//         return;
//     }

//     navigator.clipboard.writeText(currentCitation.citation).then(() => {
//         toast('📋 Citation copied to clipboard!');
//     }).catch(err => {
//         toast('❌ Failed to copy: ' + err.message);
//     });
// }

// function downloadCitationAsBib() {
//     if (!currentCitation) {
//         toast('⚠️ No citation to download');
//         return;
//     }

//     // Generate BibTeX format
//     const title = currentCitation.data.title || 'untitled';
//     const authors = currentCitation.data.authors || ['Unknown'];
//     const year = currentCitation.data.year || new Date().getFullYear();

//     const bibtex = `@${currentCitation.sourceType}{
//   key${year},
//   author = {${authors.join(' and ')}},
//   title = {${title}},
//   year = {${year}}
// }`;

//     downloadFile(bibtex, 'citation.bib', 'text/plain');
//     toast('📋 Downloading as .bib');
// }

// function downloadCitationAsCsv() {
//     if (!currentCitation) {
//         toast('⚠️ No citation to download');
//         return;
//     }

//     const data = currentCitation.data;
//     const headers = Object.keys(data);
//     const values = headers.map(h => `"${(data[h] || '').toString().replace(/"/g, '""')}"`);

//     const csv = headers.join(',') + '\n' + values.join(',');
//     downloadFile(csv, 'citation.csv', 'text/csv');
//     toast('📊 Downloading as .csv');
// }

// function downloadCitationAsTxt() {
//     if (!currentCitation) {
//         toast('⚠️ No citation to download');
//         return;
//     }

//     const content = `Citation (${currentCitation.style.toUpperCase()}):\n\n${currentCitation.citation}`;
//     downloadFile(content, 'citation.txt', 'text/plain');
//     toast('📝 Downloading as .txt');
// }

// function downloadFile(content, filename, mimeType) {
//     chrome.runtime.sendMessage({
//         action: 'downloadFile',
//         content: content,
//         filename: filename,
//         mimeType: mimeType
//     });
// }

// // ═══════════════════════════════════════════════════════════════════
// // STORAGE FUNCTIONS
// // ═══════════════════════════════════════════════════════════════════

// function loadBookmarks() {
//     chrome.storage.local.get(['bookmarks', 'sectionBookmarks'], (result) => {
//         bookmarks = result.bookmarks || [];
//         sectionBookmarks = result.sectionBookmarks || [];
//         renderBookmarks();
//         renderSectionBookmarks();
//     });
// }

// function persistBookmarks() {
//     chrome.storage.local.set({
//         bookmarks: bookmarks,
//         sectionBookmarks: sectionBookmarks
//     });
// }

// function loadNotes() {
//     chrome.storage.local.get(['researchNotesV2'], (result) => {
//         notes = result.researchNotesV2 || [];
//         renderNotes();
//     });
// }

// function persistNotes() {
//     chrome.storage.local.set({ researchNotesV2: notes });
// }

// // ═══════════════════════════════════════════════════════════════════
// // EXISTING FUNCTIONS (from previous implementation)
// // ═══════════════════════════════════════════════════════════════════

// async function summarizeSelection() {
//     try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         const [{ result: sel }] = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => window.getSelection().toString()
//         });

//         if (!sel || !sel.trim()) {
//             showResult('⚠️ Please select some text on the page first.', false);
//             hideChat();
//             return;
//         }

//         showResult('Summarising…', false);
//         hideSavePromptBar();
//         hideChat();

//         currentConversation.originalSelectedText = sel.trim();
//         currentConversation.messages = [];
//         currentConversation.isActive = false;

//         const res = await fetch('http://localhost:8080/api/research/process', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//                 content: sel.trim(), 
//                 operation: 'summarize'
//             })
//         });
//         if (!res.ok) throw new Error('API error ' + res.status);

//         lastSummary = (await res.text()).trim();
//         currentConversation.currentSummary = lastSummary;
//         currentConversation.isActive = true;

//         showResult(lastSummary, true);
//         showSavePromptBar();
//         showChat();
//         toast('✅ Summary ready! Ask follow-up questions below.');

//     } catch (err) {
//         showResult('❌ ' + err.message, false);
//         hideSavePromptBar();
//         hideChat();
//     }
// }

// function saveSummaryAsNote() {
//     if (!lastSummary) return;
//     saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
//     hideSavePromptBar();
//     toast('✅ Summary saved!');
// }

// function saveManualNote() {
//     const el = document.getElementById('quickNoteInput');
//     const text = el.value.trim();
//     if (!text) { toast('⚠️ Type a note first.'); return; }
//     saveNote({ title: autoTitle(text), content: text, type: 'manual' });
//     el.value = '';
//     toast('✅ Note saved!');
// }

// async function sendFollowUpQuestion() {
//     const chatInput = document.getElementById('chatInput');
//     const question = chatInput.value.trim();

//     if (!question) {
//         toast('⚠️ Type a question!');
//         return;
//     }

//     if (!currentConversation.isActive) {
//         toast('⚠️ Get a summary first!');
//         return;
//     }

//     addMessageToChat('user', question);
//     currentConversation.messages.push({ role: 'user', content: question });
//     chatInput.value = '';
//     addMessageToChat('assistant', '⏳ Thinking...');

//     try {
//         const res = await fetch('http://localhost:8080/api/research/process', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 operation: 'followup',
//                 question: question,
//                 content: currentConversation.currentSummary,
//                 originalSelectedText: currentConversation.originalSelectedText,
//                 conversationHistory: currentConversation.messages.slice(0, -1)
//             })
//         });

//         if (!res.ok) throw new Error('API error ' + res.status);

//         const answer = (await res.text()).trim();
//         removeLastMessage();
//         addMessageToChat('assistant', answer);
//         currentConversation.messages.push({ role: 'assistant', content: answer });
//         scrollChatToBottom();

//     } catch (err) {
//         removeLastMessage();
//         addMessageToChat('assistant', '❌ Error: ' + err.message);
//     }
// }

// function saveConversationAsNote() {
//     if (currentConversation.messages.length === 0) {
//         toast('⚠️ No conversation to save!');
//         return;
//     }

//     let conversationText = 'ORIGINAL TEXT:\n';
//     conversationText += currentConversation.originalSelectedText + '\n\n';
//     conversationText += 'SUMMARY:\n';
//     conversationText += currentConversation.currentSummary + '\n\n';
//     conversationText += 'CONVERSATION:\n';
//     conversationText += '─'.repeat(50) + '\n';

//     currentConversation.messages.forEach((msg, idx) => {
//         if (msg.role === 'user') {
//             conversationText += `\n[Question]\n`;
//             conversationText += msg.content + '\n';
//         } else {
//             conversationText += `\n[Answer]\n`;
//             conversationText += msg.content + '\n';
//         }
//     });

//     saveNote({
//         title: autoTitle(currentConversation.currentSummary) + ' (with Q&A)',
//         content: conversationText,
//         type: 'conversation'
//     });

//     toast('✅ Conversation saved!');
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
//     const note = notes.find(n => n.id === id);
//     if (!note) return;
//     const newTitle = prompt('Enter new note title:', note.title);
//     if (newTitle === null) return;
//     const cleanTitle = newTitle.trim();
//     if (!cleanTitle) {
//         toast('⚠️ Title cannot be empty');
//         return;
//     }
//     note.title = cleanTitle;
//     persistNotes();
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

// function renderNotes() {
//     const list = document.getElementById('notesList');
//     const countEl = document.getElementById('noteCount');
//     countEl.textContent = notes.length;

//     if (!notes.length) {
//         list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
//         return;
//     }

//     list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');
//     attachNoteHandlers();
// }

// function getSorted() {
//     return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
// }

// function buildCardHTML(note) {
//     const safeTitle = escHTML(note.title);
//     const safePreview = escHTML(truncate(note.content, 120));
//     const date = formatDate(note.createdAt);
//     const badgeLabel = { 
//         summary: 'Summary', 
//         bookmark: 'Bookmark', 
//         manual: 'Note',
//         conversation: 'Conversation'
//     }[note.type] || 'Note';
//     const pinClass = note.pinned ? 'pin-btn pin-on' : 'pin-btn';
//     const pinTitle = note.pinned ? 'Unpin' : 'Pin';
//     const expandOpen = note.expanded ? 'open' : '';
//     const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';

//     return `
//        <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
//          <div class="note-card-top">
//            <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" data-tooltip="Click to read full note">
//              <span class="note-title-text">${safeTitle}</span>
//              <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
//            </button>
//            <div class="card-actions">
//              <button class="card-icon-btn ${pinClass}" data-tooltip="${pinTitle}" title="${pinTitle}">📌</button>
//              <button class="card-icon-btn edit-btn" data-tooltip="Edit title" title="Edit">✏️</button>
//              <button class="card-icon-btn dl-btn" data-tooltip="Download" title="Download">
//                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//              </button>
//              <button class="card-icon-btn del-btn" data-tooltip="Delete" title="Delete">
//                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
//              </button>
//            </div>
//          </div>
//          <div class="note-preview">${safePreview}</div>
//          <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note"></div>
//          <div class="note-footer">
//            <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
//            <span class="note-date">${date}</span>
//            ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
//          </div>
//        </div>`;
// }

// function attachNoteHandlers() {
//     const list = document.getElementById('notesList');
//     list.querySelectorAll('.note-card').forEach(card => {
//         const id = card.dataset.id;
//         const titleBtn = card.querySelector('.note-title-btn');
//         if (titleBtn) titleBtn.addEventListener('click', () => toggleExpand(id));
//         const dlBtn = card.querySelector('.dl-btn');
//         if (dlBtn) dlBtn.addEventListener('click', () => openNoteExportModal(id));
//         const pinBtn = card.querySelector('.pin-btn');
//         if (pinBtn) pinBtn.addEventListener('click', () => togglePin(id));
//         const editBtn = card.querySelector('.edit-btn');
//         if (editBtn) editBtn.addEventListener('click', () => editNoteTitle(id));
//         const delBtn = card.querySelector('.del-btn');
//         if (delBtn) delBtn.addEventListener('click', () => deleteNote(id));
//     });

//     // Patch for note content
//     (function patchRender() {
//         const observer = new MutationObserver(() => {
//             list.querySelectorAll('.note-expand').forEach(el => {
//                 const card = el.closest('.note-card');
//                 if (!card) return;
//                 const id = card.dataset.id;
//                 if (!id || el._filled) return;
//                 const note = notes.find(n => n.id === id);
//                 if (!note) return;
//                 el.textContent = note.content;
//                 el._filled = true;
//             });
//         });
//         observer.observe(list, { childList: true, subtree: false });
//     })();
// }

// // Chat UI helpers
// function showChat() {
//     document.getElementById('chatBox').classList.remove('hidden');
// }

// function hideChat() {
//     document.getElementById('chatBox').classList.add('hidden');
// }

// function addMessageToChat(role, content) {
//     const chatMessages = document.getElementById('chatMessages');
//     const messageEl = document.createElement('div');
//     messageEl.className = `chat-message ${role}`;

//     const badgeEl = document.createElement('span');
//     badgeEl.className = `chat-badge badge-${role}`;
//     badgeEl.textContent = role === 'user' ? 'You' : 'Assistant';

//     const bubbleEl = document.createElement('div');
//     bubbleEl.className = 'chat-bubble';
//     bubbleEl.textContent = content;

//     messageEl.appendChild(badgeEl);
//     messageEl.appendChild(bubbleEl);
//     chatMessages.appendChild(messageEl);
// }

// function removeLastMessage() {
//     const chatMessages = document.getElementById('chatMessages');
//     if (chatMessages.lastChild) {
//         chatMessages.removeChild(chatMessages.lastChild);
//     }
// }

// function scrollChatToBottom() {
//     const chatMessages = document.getElementById('chatMessages');
//     setTimeout(() => {
//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     }, 100);
// }

// // UI helpers
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
//         }, 500);
//     });

//     document.addEventListener('mouseout', (e) => {
//         if (!e.target.closest('[data-tooltip]')) return;
//         clearTimeout(showTid);
//         tip.classList.remove('visible');
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

// // Export functions (stubs - implement as needed)
// function openExportModal() {
//     if (!notes.length) { toast('⚠️ No notes to export.'); return; }
//     // Implement export modal
// }

// function openNoteExportModal(id) {
//     // Implement note export
// }


'use strict';

const MAX_CHARS = 15000;

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════
let notes = [];
let bookmarks = [];
let sectionBookmarks = [];
let lastSummary = '';
let currentCitation = null;
let currentCitationStep = 1;

let currentConversation = {
    originalSelectedText: '',
    currentSummary: '',
    messages: [],
    isActive: false
};

// ═══════════════════════════════════════════════════════════════════
// CITATION STYLES
// ═══════════════════════════════════════════════════════════════════
const CITATION_STYLES = {
    apa: {
        name: 'APA 7th Edition',
        journal: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title}. ${d.journal}, ${d.volume}${d.issue ? `(${d.issue})` : ''}, ${d.pages || 'n.p.'}.`,
        book: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title}. ${d.publisher}.`,
        website: (d) => `${d.authors?.[0] || 'Unknown'} (${d.year}). ${d.title}. Retrieved from ${d.url}`,
        thesis: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title} [Doctoral dissertation, ${d.university}].`,
        conference: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title}. In ${d.conference} (pp. ${d.pages || 'n.p.'}).`,
        report: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title}. ${d.publisher}.`,
        preprint: (d) => `${d.authors?.join(', ') || 'Unknown'} (${d.year}). ${d.title}. Retrieved from ${d.url || d.server}`,
    },
    ieee: {
        name: 'IEEE',
        journal: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, "${d.title}," ${d.journal}, vol. ${d.volume}${d.issue ? `, no. ${d.issue}` : ''}, pp. ${d.pages || 'n.p.'}, ${d.year}.`,
        book: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, ${d.title}. ${d.publisher}, ${d.year}.`,
        website: (d) => `[1] [Online]. Available: ${d.url}. [Accessed: ${new Date().toLocaleDateString()}].`,
        thesis: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, "${d.title}," Ph.D. dissertation, ${d.university}, ${d.year}.`,
        conference: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, "${d.title}," in Proc. ${d.conference}, ${d.year}, pp. ${d.pages || 'n.p.'}.`,
        report: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, "${d.title}," ${d.publisher}, ${d.year}.`,
        preprint: (d) => `[1] ${d.authors?.[0]?.split(' ').pop() || 'Author'}, "${d.title}," ${d.server || 'Preprint'}, ${d.year}.`,
    },
    chicago: {
        name: 'Chicago/Turabian',
        journal: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.journal} ${d.volume}, no. ${d.issue || '1'} (${d.year}): ${d.pages || 'n.p.'}.`,
        book: (d) => `${d.authors?.join(', ') || 'Unknown'}. ${d.title}. ${d.publisher}, ${d.year}.`,
        website: (d) => `"${d.title}." Accessed ${new Date().toLocaleDateString()}. ${d.url}.`,
        thesis: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." PhD diss., ${d.university}, ${d.year}.`,
        conference: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." In ${d.conference}, ${d.year}.`,
        report: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.publisher}, ${d.year}.`,
        preprint: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.server || 'Preprint'}, ${d.year}.`,
    },
    mla: {
        name: 'MLA 9th Edition',
        journal: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.journal}, vol. ${d.volume}, no. ${d.issue || '1'}, ${d.year}, pp. ${d.pages || 'n.p.'}.`,
        book: (d) => `${d.authors?.join(', ') || 'Unknown'}. ${d.title}. ${d.publisher}, ${d.year}.`,
        website: (d) => `${d.authors?.[0] || 'Unknown'}. "${d.title}." Web. Accessed ${new Date().toLocaleDateString()}.`,
        thesis: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." University of ${d.university}, ${d.year}. Dissertation.`,
        conference: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.conference}, ${d.year}.`,
        report: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.publisher}, ${d.year}.`,
        preprint: (d) => `${d.authors?.join(', ') || 'Unknown'}. "${d.title}." ${d.server || 'Preprint'}, ${d.year}.`,
    },
    harvard: {
        name: 'Harvard',
        journal: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. ${d.journal}, ${d.volume}(${d.issue || '1'}), pp.${d.pages || 'n.p.'}.`,
        book: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. ${d.publisher}.`,
        website: (d) => `${d.authors?.[0] || 'Unknown'}, ${d.year}. ${d.title}. Available at: ${d.url}`,
        thesis: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. ${d.university}.`,
        conference: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. In: ${d.conference}.`,
        report: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. ${d.publisher}.`,
        preprint: (d) => `${d.authors?.join(', ') || 'Unknown'}, ${d.year}. ${d.title}. ${d.server || 'Preprint'}.`,
    }
};

const CITATION_FIELDS = {
    journal: [
        { name: 'authors', label: 'Authors (comma-separated)', type: 'text', required: true },
        { name: 'title', label: 'Article Title', type: 'text', required: true },
        { name: 'journal', label: 'Journal Name', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'volume', label: 'Volume', type: 'number', required: true },
        { name: 'issue', label: 'Issue', type: 'number', required: false },
        { name: 'pages', label: 'Pages', type: 'text', required: false },
        { name: 'doi', label: 'DOI', type: 'text', required: false },
    ],
    book: [
        { name: 'authors', label: 'Author(s)', type: 'text', required: true },
        { name: 'title', label: 'Book Title', type: 'text', required: true },
        { name: 'publisher', label: 'Publisher', type: 'text', required: true },
        { name: 'year', label: 'Year Published', type: 'number', required: true },
    ],
    website: [
        { name: 'authors', label: 'Website/Organization', type: 'text', required: true },
        { name: 'title', label: 'Page Title', type: 'text', required: true },
        { name: 'url', label: 'URL', type: 'url', required: true },
        { name: 'year', label: 'Year Accessed', type: 'number', required: true },
    ],
    thesis: [
        { name: 'authors', label: 'Author', type: 'text', required: true },
        { name: 'title', label: 'Thesis Title', type: 'text', required: true },
        { name: 'university', label: 'University', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
    ],
    conference: [
        { name: 'authors', label: 'Author(s)', type: 'text', required: true },
        { name: 'title', label: 'Paper Title', type: 'text', required: true },
        { name: 'conference', label: 'Conference Name', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'pages', label: 'Pages', type: 'text', required: false },
    ],
    report: [
        { name: 'authors', label: 'Author/Organization', type: 'text', required: true },
        { name: 'title', label: 'Report Title', type: 'text', required: true },
        { name: 'publisher', label: 'Publisher/Organization', type: 'text', required: true },
        { name: 'year', label: 'Year', type: 'number', required: true },
    ],
    preprint: [
        { name: 'authors', label: 'Author(s)', type: 'text', required: true },
        { name: 'title', label: 'Preprint Title', type: 'text', required: true },
        { name: 'server', label: 'Server (arXiv, bioRxiv…)', type: 'text', required: false },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'url', label: 'URL', type: 'url', required: false },
    ]
};

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    loadBookmarks();
    bindAllEventListeners();
    initTooltips();
});

// ═══════════════════════════════════════════════════════════════════
// EVENT BINDING
// FIX: all getElementById calls now match the IDs that actually exist
//      in the HTML. Inline onclick handlers have been removed from HTML.
// ═══════════════════════════════════════════════════════════════════
function bindAllEventListeners() {
    // Main panel buttons
    document.getElementById('summarizeButton').addEventListener('click', summarizeSelection);
    document.getElementById('summarizePageButton').addEventListener('click', summarizeFullPage);
    document.getElementById('bookmarkPageBtn').addEventListener('click', openBookmarkPageModal);
    document.getElementById('bookmarkHeadingBtn').addEventListener('click', openBookmarkHeadingModal);
    document.getElementById('citationBtn').addEventListener('click', openCitationModal);
    document.getElementById('saveManualNote').addEventListener('click', saveManualNote);
    document.getElementById('saveSummaryBtn').addEventListener('click', saveSummaryAsNote);
    document.getElementById('chatSendBtn').addEventListener('click', sendFollowUpQuestion);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFollowUpQuestion(); }
    });
    document.getElementById('saveConversationBtn').addEventListener('click', saveConversationAsNote);
    document.getElementById('exportBtn').addEventListener('click', openExportModal);

    // Export modal
    // FIX: ID changed from 'closeExport' → 'closeExportModal' to match HTML
    document.getElementById('closeExportModal').addEventListener('click', closeExportModal);
    document.getElementById('exportHTML').addEventListener('click', () => exportNotes('html'));
    document.getElementById('exportDoc').addEventListener('click', () => exportNotes('txt'));
    document.getElementById('exportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('exportModal')) closeExportModal();
    });

    // Single note export modal
    // FIX: IDs changed from 'closeNoteExport'/'noteExportHTML'/'noteExportDoc'
    //      → 'closeNoteExportModal'/'noteExportHTML'/'noteExportDoc' to match HTML
    document.getElementById('closeNoteExportModal').addEventListener('click', closeNoteExportModal);
    document.getElementById('noteExportHTML').addEventListener('click', () => {
        exportSingleNote(window._activeNoteId, 'html');
    });
    document.getElementById('noteExportDoc').addEventListener('click', () => {
        exportSingleNote(window._activeNoteId, 'txt');
    });
    document.getElementById('noteExportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('noteExportModal')) closeNoteExportModal();
    });

    // Bookmark page modal
    document.getElementById('closeBookmarkModal').addEventListener('click', closeBookmarkPageModal);
    document.getElementById('confirmBookmark').addEventListener('click', confirmBookmark);
    document.getElementById('cancelBookmark').addEventListener('click', closeBookmarkPageModal);
    document.getElementById('bookmarkModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('bookmarkModal')) closeBookmarkPageModal();
    });

    // Bookmark heading modal
    document.getElementById('closeHeadingModal').addEventListener('click', closeBookmarkHeadingModal);
    document.getElementById('confirmHeadingBookmark').addEventListener('click', confirmHeadingBookmark);
    document.getElementById('cancelHeadingBookmark').addEventListener('click', closeBookmarkHeadingModal);
    document.getElementById('bookmarkHeadingModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('bookmarkHeadingModal')) closeBookmarkHeadingModal();
    });

    // Citation modal
    document.getElementById('closeCitationModal').addEventListener('click', closeCitationModal);
    document.getElementById('cancelCitation').addEventListener('click', closeCitationModal);
    document.getElementById('citationModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('citationModal')) closeCitationModal();
    });

    // Citation wizard navigation
    document.getElementById('citationNext').addEventListener('click', citationNext);
    document.getElementById('citationPrev').addEventListener('click', citationPrev);
    document.getElementById('generateCitation').addEventListener('click', generateCitation);

    // Citation source type → populate fields and advance
    document.getElementById('sourceType').addEventListener('change', () => {
        updateCitationFields();
    });

    // Citation style search
    document.getElementById('styleSearch').addEventListener('input', filterCitationStyles);

    // Citation style selection (delegation)
    document.getElementById('citationStylesGrid').addEventListener('change', (e) => {
        if (e.target.classList.contains('style-radio')) {
            updateSelectedStyleDisplay();
        }
    });

    // Citation export buttons (step 4)
    document.getElementById('copyCitation').addEventListener('click', copyCitationToClipboard);
    document.getElementById('downloadBib').addEventListener('click', downloadCitationAsBib);
    document.getElementById('downloadCsv').addEventListener('click', downloadCitationAsCsv);
    document.getElementById('downloadTxt').addEventListener('click', downloadCitationAsTxt);

    // Bookmark list delegation
    document.getElementById('bookmarksList').addEventListener('click', handleBookmarkListClick);
    document.getElementById('sectionBookmarksList').addEventListener('click', handleSectionListClick);

    // Note list delegation
    document.getElementById('notesList').addEventListener('click', handleNoteListClick);
}

// ═══════════════════════════════════════════════════════════════════
// EVENT DELEGATION HANDLERS
// ═══════════════════════════════════════════════════════════════════
function handleBookmarkListClick(e) {
    if (e.target.classList.contains('bookmark-delete-btn')) {
        deleteBookmark(e.target.dataset.id);
    }
}

function handleSectionListClick(e) {
    if (e.target.classList.contains('section-delete-btn')) {
        deleteSectionBookmark(e.target.dataset.id);
    }
}

function handleNoteListClick(e) {
    const card = e.target.closest('.note-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('.note-title-btn')) { toggleExpand(id); return; }
    if (e.target.closest('.del-btn')) { deleteNote(id); return; }
    if (e.target.closest('.edit-btn')) { editNoteTitle(id); return; }
    if (e.target.closest('.dl-btn')) { openNoteExportModal(id); return; }
    if (e.target.closest('.pin-btn')) { togglePin(id); return; }
}

// ═══════════════════════════════════════════════════════════════════
// BOOKMARK SYSTEM
// ═══════════════════════════════════════════════════════════════════
async function openBookmarkPageModal() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const modal = document.getElementById('bookmarkModal');
    modal.dataset.url = tab.url;
    modal.dataset.title = tab.title;
    document.getElementById('bookmarkName').value = '';
    modal.classList.remove('hidden');
}

function closeBookmarkPageModal() {
    document.getElementById('bookmarkModal').classList.add('hidden');
}

async function confirmBookmark() {
    const modal = document.getElementById('bookmarkModal');
    const customName = document.getElementById('bookmarkName').value.trim();
    const bookmark = {
        id: 'bm' + Date.now(),
        name: customName || modal.dataset.title,
        url: modal.dataset.url,
        createdAt: new Date().toISOString(),
        visitCount: 0,
        lastVisited: null
    };
    bookmarks.unshift(bookmark);
    persistBookmarks();
    renderBookmarks();
    closeBookmarkPageModal();
    toast('🔖 Page bookmarked!');
}

function deleteBookmark(id) {
    const idx = bookmarks.findIndex(b => b.id === id);
    if (idx > -1) {
        bookmarks.splice(idx, 1);
        persistBookmarks();
        renderBookmarks();
        toast('🗑 Bookmark deleted');
    }
}

function renderBookmarks() {
    const list = document.getElementById('bookmarksList');
    const count = document.getElementById('bookmarkCount');
    count.textContent = bookmarks.length;

    if (!bookmarks.length) {
        list.innerHTML = '<div class="empty-state"><span class="empty-icon">🔖</span><p>No bookmarks yet.</p></div>';
        return;
    }

    list.innerHTML = bookmarks.map(bm => `
        <div class="bookmark-item" data-id="${bm.id}">
            <span class="bookmark-icon">🔖</span>
            <div class="bookmark-info">
                <a href="${escHTML(bm.url)}" target="_blank" class="bookmark-link" title="Open in new tab">
                    <span class="bookmark-name">${escHTML(bm.name)}</span>
                </a>
                <div class="bookmark-meta">
                    ${new Date(bm.createdAt).toLocaleDateString()} · Visited ${bm.visitCount} time${bm.visitCount !== 1 ? 's' : ''}
                    ${bm.lastVisited ? ' · Last: ' + new Date(bm.lastVisited).toLocaleDateString() : ''}
                </div>
            </div>
            <div class="bookmark-actions">
                <button class="bookmark-delete-btn" data-id="${bm.id}" title="Delete" aria-label="Delete bookmark">🗑️</button>
            </div>
        </div>
    `).join('');

    // FIX: track visit count when a bookmark link is clicked
    list.querySelectorAll('.bookmark-link').forEach(link => {
        link.addEventListener('click', () => {
            const item = link.closest('.bookmark-item');
            if (!item) return;
            const bm = bookmarks.find(b => b.id === item.dataset.id);
            if (!bm) return;
            bm.visitCount++;
            bm.lastVisited = new Date().toISOString();
            persistBookmarks();
        });
    });
}

// Section bookmarks
async function openBookmarkHeadingModal() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result: selectedText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString() || ''
    });
    const modal = document.getElementById('bookmarkHeadingModal');
    modal.dataset.pageUrl = tab.url;
    const input = document.getElementById('headingName');
    input.value = selectedText || '';
    input.focus();
    modal.classList.remove('hidden');
}

function closeBookmarkHeadingModal() {
    document.getElementById('bookmarkHeadingModal').classList.add('hidden');
}

function confirmHeadingBookmark() {
    const modal = document.getElementById('bookmarkHeadingModal');
    const name = document.getElementById('headingName').value.trim();
    const pageUrl = modal.dataset.pageUrl;

    if (!name) { toast('⚠️ Please enter a section name'); return; }

    const bookmark = {
        id: 'sec' + Date.now(),
        name: name,
        pageUrl: pageUrl,
        createdAt: new Date().toISOString()
    };
    sectionBookmarks.unshift(bookmark);
    persistBookmarks();
    renderSectionBookmarks();
    closeBookmarkHeadingModal();
    toast('📌 Section bookmarked!');
}

function deleteSectionBookmark(id) {
    const idx = sectionBookmarks.findIndex(b => b.id === id);
    if (idx > -1) {
        sectionBookmarks.splice(idx, 1);
        persistBookmarks();
        renderSectionBookmarks();
        toast('🗑 Section bookmark deleted');
    }
}

function renderSectionBookmarks() {
    const list = document.getElementById('sectionBookmarksList');
    const count = document.getElementById('sectionCount');
    count.textContent = sectionBookmarks.length;

    if (!sectionBookmarks.length) {
        list.innerHTML = '<div class="empty-state"><span class="empty-icon">📌</span><p>No section bookmarks yet.</p></div>';
        return;
    }

    list.innerHTML = sectionBookmarks.map(bm => `
        <div class="bookmark-item" data-id="${bm.id}">
            <span class="bookmark-icon">📌</span>
            <div class="bookmark-info">
                <a href="${escHTML(bm.pageUrl)}" target="_blank" class="bookmark-link" title="Open page">
                    <span class="bookmark-name">${escHTML(bm.name)}</span>
                </a>
                <div class="bookmark-meta">${new Date(bm.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="bookmark-actions">
                <button class="section-delete-btn" data-id="${bm.id}" title="Delete" aria-label="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CITATION SYSTEM
// FIX: replaced confusing single-step reveal with a proper wizard.
//      Steps 1→2→3 use Next/Back; step 3 shows Generate button.
//      Step 4 is only shown after generation succeeds.
// ═══════════════════════════════════════════════════════════════════
function openCitationModal() {
    document.getElementById('citationModal').classList.remove('hidden');
    renderCitationStyles();
    // Reset wizard to step 1
    currentCitationStep = 1;
    document.getElementById('sourceType').value = '';
    document.getElementById('citationFields').innerHTML = '';
    document.getElementById('citationPreview').textContent = '';
    document.getElementById('selectedStyleDisplay').classList.add('hidden');
    currentCitation = null;
    showCitationStep(1);
}

function closeCitationModal() {
    document.getElementById('citationModal').classList.add('hidden');
}

function showCitationStep(n) {
    currentCitationStep = n;
    [1, 2, 3, 4].forEach(i => {
        const el = document.getElementById('citationStep' + i);
        if (el) el.classList.toggle('active', i === n);
    });

    const prevBtn = document.getElementById('citationPrev');
    const nextBtn = document.getElementById('citationNext');
    const generateBtn = document.getElementById('generateCitation');

    // Back button: visible on steps 2-4
    prevBtn.style.display = (n > 1) ? '' : 'none';

    // Step 4 is results-only: hide Next and Generate
    if (n === 4) {
        nextBtn.classList.add('hidden');
        generateBtn.classList.add('hidden');
        return;
    }

    // Step 3: show Generate instead of Next
    if (n === 3) {
        nextBtn.classList.add('hidden');
        generateBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        generateBtn.classList.add('hidden');
    }
}

function citationNext() {
    if (currentCitationStep === 1) {
        const sourceType = document.getElementById('sourceType').value;
        if (!sourceType) { toast('⚠️ Please select a source type'); return; }
        updateCitationFields();
    }
    if (currentCitationStep === 2) {
        // Validate required fields before advancing
        const sourceType = document.getElementById('sourceType').value;
        const fields = CITATION_FIELDS[sourceType] || [];
        for (const field of fields) {
            if (field.required) {
                const el = document.getElementById('field_' + field.name);
                if (!el || !el.value.trim()) {
                    toast(`⚠️ Please fill in: ${field.label}`);
                    return;
                }
            }
        }
    }
    showCitationStep(currentCitationStep + 1);
}

function citationPrev() {
    if (currentCitationStep > 1) showCitationStep(currentCitationStep - 1);
}

function renderCitationStyles() {
    const grid = document.getElementById('citationStylesGrid');
    grid.innerHTML = Object.entries(CITATION_STYLES).map(([key, style]) => `
        <div class="style-option" data-style="${key}">
            <input type="radio" id="style_${key}" name="citationStyle" value="${key}" class="style-radio">
            <label for="style_${key}" class="style-label">
                <span class="style-name">${style.name}</span>
            </label>
        </div>
    `).join('');
}

function filterCitationStyles(e) {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.style-option').forEach(opt => {
        opt.style.display = opt.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

function updateSelectedStyleDisplay() {
    const selected = document.querySelector('input[name="citationStyle"]:checked');
    if (selected) {
        const styleName = selected.parentElement.querySelector('.style-name').textContent;
        document.getElementById('selectedStyleName').textContent = styleName;
        document.getElementById('selectedStyleDisplay').classList.remove('hidden');
    }
}

function updateCitationFields() {
    const sourceType = document.getElementById('sourceType').value;
    if (!sourceType) return;
    const fields = CITATION_FIELDS[sourceType] || [];
    const container = document.getElementById('citationFields');
    container.innerHTML = fields.map(field => `
        <div class="form-group">
            <label for="field_${field.name}">
                ${field.label}${field.required ? ' *' : ''}
            </label>
            <input
                type="${field.type}"
                id="field_${field.name}"
                class="form-input"
                placeholder="${field.label}"
                data-field="${field.name}"
                ${field.required ? 'required' : ''}
            >
        </div>
    `).join('');
}

function generateCitation() {
    const sourceType = document.getElementById('sourceType').value;
    if (!sourceType) { toast('⚠️ Please select a source type first'); return; }

    // Collect form data
    const data = {};
    document.querySelectorAll('#citationFields input').forEach(input => {
        const fieldName = input.dataset.field;
        const value = input.value.trim();
        data[fieldName] = (fieldName === 'authors')
            ? value.split(',').map(a => a.trim()).filter(Boolean)
            : value;
    });

    // Validate required fields
    const fields = CITATION_FIELDS[sourceType];
    for (const field of fields) {
        const val = data[field.name];
        if (field.required && (!val || (Array.isArray(val) ? val.length === 0 : val === ''))) {
            toast(`⚠️ Please fill in: ${field.label}`);
            return;
        }
    }

    const styleRadio = document.querySelector('input[name="citationStyle"]:checked');
    if (!styleRadio) { toast('⚠️ Please select a citation style'); return; }

    const citationStyle = styleRadio.value;
    const styleGenerators = CITATION_STYLES[citationStyle] || CITATION_STYLES.apa;
    const generator = styleGenerators[sourceType] || styleGenerators.journal;

    try {
        const citation = generator(data);
        currentCitation = { citation, data, sourceType, style: citationStyle };
        document.getElementById('citationPreview').textContent = citation;
        showCitationStep(4);
        toast('✅ Citation generated!');
    } catch (err) {
        toast('❌ Error: ' + err.message);
    }
}

function copyCitationToClipboard() {
    if (!currentCitation) { toast('⚠️ No citation to copy'); return; }
    navigator.clipboard.writeText(currentCitation.citation)
        .then(() => toast('📋 Citation copied to clipboard!'))
        .catch(err => toast('❌ Failed to copy: ' + err.message));
}

function downloadCitationAsBib() {
    if (!currentCitation) { toast('⚠️ No citation to download'); return; }
    const { data, sourceType } = currentCitation;
    const year = data.year || new Date().getFullYear();
    const authors = data.authors || ['Unknown'];
    const title = data.title || 'untitled';
    const bibtex = `@${sourceType}{key${year},\n  author = {${authors.join(' and ')}},\n  title = {${title}},\n  year = {${year}}\n}`;
    downloadFile(bibtex, 'citation.bib', 'text/plain');
    toast('📥 Downloading .bib…');
}

function downloadCitationAsCsv() {
    if (!currentCitation) { toast('⚠️ No citation to download'); return; }
    const data = currentCitation.data;
    const headers = Object.keys(data);
    const values = headers.map(h => `"${(data[h] || '').toString().replace(/"/g, '""')}"`);
    downloadFile(headers.join(',') + '\n' + values.join(','), 'citation.csv', 'text/csv');
    toast('📊 Downloading .csv…');
}

function downloadCitationAsTxt() {
    if (!currentCitation) { toast('⚠️ No citation to download'); return; }
    const content = `Citation (${currentCitation.style.toUpperCase()}):\n\n${currentCitation.citation}`;
    downloadFile(content, 'citation.txt', 'text/plain');
    toast('📄 Downloading .txt…');
}

function downloadFile(content, filename, mimeType) {
    chrome.runtime.sendMessage({ action: 'downloadFile', content, filename, mimeType });
}

function extractMetadata() {
    return {
        title: document.querySelector('meta[name="og:title"]')?.content || document.title,
        author: document.querySelector('meta[name="author"]')?.content || '',
        date: document.querySelector('meta[name="article:published_time"]')?.content || ''
    };
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════
function loadBookmarks() {
    chrome.storage.local.get(['bookmarks', 'sectionBookmarks'], (result) => {
        bookmarks = result.bookmarks || [];
        sectionBookmarks = result.sectionBookmarks || [];
        renderBookmarks();
        renderSectionBookmarks();
    });
}

function persistBookmarks() {
    chrome.storage.local.set({ bookmarks, sectionBookmarks });
}

function loadNotes() {
    chrome.storage.local.get(['researchNotesV2'], (result) => {
        notes = result.researchNotesV2 || [];
        renderNotes();
    });
}

function persistNotes() {
    chrome.storage.local.set({ researchNotesV2: notes });
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARISE & CHAT
// ═══════════════════════════════════════════════════════════════════
async function summarizeSelection() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result: sel }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!sel || !sel.trim()) {
            showResult('⚠️ Please select some text on the page first.', false);
            hideChat();
            return;
        }

        showResult('Summarising…', false);
        hideSavePromptBar();
        hideChat();

        currentConversation.originalSelectedText = sel.trim();
        currentConversation.messages = [];
        currentConversation.isActive = false;

        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: sel.trim(), operation: 'summarize' })
        });
        if (!res.ok) throw new Error('API error ' + res.status);

        lastSummary = (await res.text()).trim();
        currentConversation.currentSummary = lastSummary;
        currentConversation.isActive = true;

        showResult(lastSummary, true);
        showSavePromptBar();
        showChat();
        toast('✅ Summary ready! Ask follow-up questions below.');

    } catch (err) {
        showResult('❌ ' + err.message, false);
        hideSavePromptBar();
        hideChat();
    }
}

async function summarizeFullPage() {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        showResult('📄 Extracting full page...', false);
        hideSavePromptBar();
        hideChat();

        // Extract full readable page text
        const [{ result: pageContent }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractFullPageContent
        });

        if (!pageContent || pageContent.length < 100) {
            throw new Error('Could not extract enough readable content.');
        }

        // Optional protection against huge pages
        // const MAX_CHARS = 15000;

        // const trimmedContent =
        //     pageContent.length > MAX_CHARS
        //         ? pageContent.slice(0, MAX_CHARS)
        //         : pageContent;

        const trimmedContent = smartTrim(pageContent);


        currentConversation.originalSelectedText = trimmedContent;
        currentConversation.messages = [];
        currentConversation.isActive = false;

        showResult('📄 Summarizing full page...', false);

        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: trimmedContent,
                operation: 'summarize'
            })
        });

        if (!res.ok) {
            throw new Error('API error ' + res.status);
        }

        lastSummary = (await res.text()).trim();

        currentConversation.currentSummary = lastSummary;
        currentConversation.isActive = true;

        showResult(lastSummary, true);

        showSavePromptBar();
        showChat();

        toast('✅ Full page summary ready!');

    } catch (err) {
        showResult('❌ ' + err.message, false);
        hideSavePromptBar();
        hideChat();
    }
}

// function extractFullPageContent() {

//     // Clone the document body
//     const clonedBody = document.body.cloneNode(true);

//     // Remove unwanted elements ONLY from clone
//     const unwanted = clonedBody.querySelectorAll(
//         'script, style, noscript, iframe, nav, footer, header, aside'
//     );

//     unwanted.forEach(el => el.remove());

//     // Prefer article/main content
//     const article =
//         clonedBody.querySelector('article') ||
//         clonedBody.querySelector('main') ||
//         clonedBody;

//     let text = article.innerText || article.textContent || '';

//     // Clean text
//     text = text
//         .replace(/\s+/g, ' ')
//         .replace(/\n+/g, '\n')
//         .trim();

//     return text;
// }

function extractFullPageContent() {

    // Prefer article/main content directly
    const article =
        document.querySelector('article') ||
        document.querySelector('main') ||
        document.body;

    // Create clean text WITHOUT modifying page
    let text = article.innerText || article.textContent || '';

    // Cleanup
    text = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

    return text;

}

function smartTrim(text, limit = MAX_CHARS) {

    if (text.length <= limit) {
        return text;
    }

    const trimmed = text.slice(0, limit);

    const lastSentence = Math.max(
        trimmed.lastIndexOf('.'),
        trimmed.lastIndexOf('!'),
        trimmed.lastIndexOf('?')
    );

    // Avoid cutting too early
    if (lastSentence > limit * 0.7) {
        return trimmed.slice(0, lastSentence + 1);
    }

    return trimmed;
}


function saveSummaryAsNote() {
    if (!lastSummary) return;
    saveNote({ title: autoTitle(lastSummary), content: lastSummary, type: 'summary' });
    hideSavePromptBar();
    toast('✅ Summary saved!');
}

function saveManualNote() {
    const el = document.getElementById('quickNoteInput');
    const text = el.value.trim();
    if (!text) { toast('⚠️ Type a note first.'); return; }
    saveNote({ title: autoTitle(text), content: text, type: 'manual' });
    el.value = '';
    toast('✅ Note saved!');
}

async function sendFollowUpQuestion() {
    const chatInput = document.getElementById('chatInput');
    const question = chatInput.value.trim();
    if (!question) { toast('⚠️ Type a question!'); return; }
    if (!currentConversation.isActive) { toast('⚠️ Get a summary first!'); return; }

    addMessageToChat('user', question);
    currentConversation.messages.push({ role: 'user', content: question });
    chatInput.value = '';
    addMessageToChat('assistant', '⏳ Thinking…');

    try {
        const res = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                operation: 'followup',
                question: question,
                content: currentConversation.currentSummary,
                originalSelectedText: currentConversation.originalSelectedText,
                conversationHistory: currentConversation.messages.slice(0, -1)
            })
        });
        if (!res.ok) throw new Error('API error ' + res.status);
        const answer = (await res.text()).trim();
        removeLastMessage();
        addMessageToChat('assistant', answer);
        currentConversation.messages.push({ role: 'assistant', content: answer });
        scrollChatToBottom();
    } catch (err) {
        removeLastMessage();
        addMessageToChat('assistant', '❌ Error: ' + err.message);
    }
}

function saveConversationAsNote() {
    if (!currentConversation.messages.length) { toast('⚠️ No conversation to save!'); return; }
    let txt = 'ORIGINAL TEXT:\n' + currentConversation.originalSelectedText + '\n\nSUMMARY:\n' +
        currentConversation.currentSummary + '\n\nCONVERSATION:\n' + '─'.repeat(50) + '\n';
    currentConversation.messages.forEach(msg => {
        txt += `\n[${msg.role === 'user' ? 'Question' : 'Answer'}]\n${msg.content}\n`;
    });
    saveNote({ title: autoTitle(currentConversation.currentSummary) + ' (with Q&A)', content: txt, type: 'conversation' });
    toast('✅ Conversation saved!');
}

// ═══════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════
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
    toast(note.pinned ? '📌 Note pinned' : '📌 Note unpinned');
}

function editNoteTitle(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newTitle = prompt('Enter new note title:', note.title);
    if (newTitle === null) return;
    const clean = newTitle.trim();
    if (!clean) { toast('⚠️ Title cannot be empty'); return; }
    note.title = clean;
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

function getSorted() {
    return [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
}

function renderNotes() {
    const list = document.getElementById('notesList');
    const countEl = document.getElementById('noteCount');
    countEl.textContent = notes.length;

    if (!notes.length) {
        list.innerHTML = `<div class="empty-state"><span class="empty-icon">🗒️</span><p>No notes yet.<br>Summarise text or bookmark a page to get started.</p></div>`;
        return;
    }
    // FIX: content is set directly in buildCardHTML — no MutationObserver needed
    list.innerHTML = getSorted().map(note => buildCardHTML(note)).join('');
}

function buildCardHTML(note) {
    const safeTitle = escHTML(note.title);
    const safePreview = escHTML(truncate(note.content, 120));
    // FIX: note content set inline in the expand div (no deferred MutationObserver)
    const safeContent = escHTML(note.content);
    const date = formatDate(note.createdAt);
    const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note', conversation: 'Conversation' }[note.type] || 'Note';
    const expandOpen = note.expanded ? 'open' : '';
    const chevRot = note.expanded ? 'style="transform:rotate(180deg)"' : '';
    // FIX: pin-on class is actually applied based on note.pinned
    const pinClass = note.pinned ? 'card-icon-btn pin-btn pin-on' : 'card-icon-btn pin-btn';
    const pinTitle = note.pinned ? 'Unpin' : 'Pin';

    return `
       <div class="note-card ${note.pinned ? 'is-pinned' : ''}" data-id="${note.id}" role="listitem">
         <div class="note-card-top">
           <button class="note-title-btn" id="tbtn-${note.id}" aria-expanded="${note.expanded}" data-tooltip="Click to read full note">
             <span class="note-title-text">${safeTitle}</span>
             <svg class="chev" ${chevRot} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;margin-top:3px;opacity:0.4;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
           </button>
           <div class="card-actions">
             <button class="${pinClass}" data-tooltip="${pinTitle}" title="${pinTitle}">📌</button>
             <button class="card-icon-btn edit-btn" data-tooltip="Edit title" title="Edit">✏️</button>
             <button class="card-icon-btn dl-btn" data-tooltip="Download" title="Download">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
             </button>
             <button class="card-icon-btn del-btn" data-tooltip="Delete" title="Delete">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
             </button>
           </div>
         </div>
         <div class="note-preview">${safePreview}</div>
         <div class="note-expand ${expandOpen}" id="exp-${note.id}" aria-label="Full note">${safeContent}</div>
         <div class="note-footer">
           <span class="note-type-badge badge-${note.type}">${badgeLabel}</span>
           <span class="note-date">${date}</span>
           ${note.pinned ? '<span class="pin-chip">Pinned</span>' : ''}
         </div>
       </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// CHAT UI HELPERS
// ═══════════════════════════════════════════════════════════════════
function showChat() { document.getElementById('chatBox').classList.remove('hidden'); }
function hideChat() { document.getElementById('chatBox').classList.add('hidden'); }

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
    scrollChatToBottom();
}

function removeLastMessage() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages.lastChild) chatMessages.removeChild(chatMessages.lastChild);
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 100);
}

// ═══════════════════════════════════════════════════════════════════
// RESULT BOX HELPERS
// ═══════════════════════════════════════════════════════════════════
function showResult(text, isPlain) {
    const box = document.getElementById('resultBox');
    const content = document.getElementById('resultContent');
    if (isPlain) content.textContent = text;
    else content.innerHTML = text;
    box.classList.remove('hidden');
}

function showSavePromptBar() { document.getElementById('savePromptBar').classList.remove('hidden'); }
function hideSavePromptBar() { document.getElementById('savePromptBar').classList.add('hidden'); lastSummary = ''; }

// ═══════════════════════════════════════════════════════════════════
// EXPORT
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
    if (format === 'html') exportAsHTML();
    else exportAsDoc();
}

function exportAsHTML() {
    const sorted = getSorted();
    const rows = sorted.map(n => {
        const date = formatDate(n.createdAt);
        const safeTitle = escHTML(n.title);
        const safeContent = escHTML(n.content).replace(/\n/g, '<br>');
        const badgeLabel = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note', conversation: 'Conversation' }[n.type] || 'Note';
        return `<div class="note">
  <div class="note-head"><span class="badge badge-${n.type}">${badgeLabel}</span>${n.pinned ? '<span class="pin">📌 Pinned</span>' : ''}<span class="date">${date}</span></div>
  <h2>${safeTitle}</h2><p>${safeContent}</p>
</div>`;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Research Notes Export</title>
<style>body{font-family:'Segoe UI',sans-serif;padding:32px;color:#1a1d2e;max-width:720px;margin:auto}h1{font-size:22px;margin-bottom:4px;color:#3b5bdb}.meta{font-size:12px;color:#888;margin-bottom:28px}.note{border:1.5px solid #e4e7f0;border-radius:10px;padding:16px 20px;margin-bottom:18px}h2{font-size:14px;margin-bottom:8px}p{font-size:12.5px;line-height:1.7;color:#4a5068;margin:0}</style>
</head><body><h1>Research Notes</h1><div class="meta">Exported ${new Date().toLocaleString()}</div>${rows}</body></html>`;

    downloadFile(html, 'research-notes.html', 'text/html');
    toast('📄 Downloading HTML…');
}

function exportAsDoc() {
    const sorted = getSorted();
    const lines = ['RESEARCH NOTES EXPORT', '='.repeat(50), 'Exported: ' + new Date().toLocaleString(), ''];
    sorted.forEach((n, i) => {
        const label = { summary: 'Summary', bookmark: 'Bookmark', manual: 'Note', conversation: 'Conversation' }[n.type] || 'Note';
        lines.push(`--- Note ${i + 1} [${label}] ---`, n.title, '', n.content, '');
    });
    downloadFile(lines.join('\n'), 'research-notes.txt', 'text/plain');
    toast('📝 Downloading TXT…');
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
    if (format === 'html') exportSingleNoteAsHTML(note);
    else exportSingleNoteAsDoc(note);
}

function exportSingleNoteAsHTML(note) {
    const safeTitle = escHTML(note.title);
    const safeContent = escHTML(note.content).replace(/\n/g, '<br>');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${safeTitle}</title>
<style>body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:680px;margin:auto}h1{font-size:20px;margin-bottom:18px}p{font-size:13px;line-height:1.8;white-space:pre-wrap}</style>
</head><body><h1>${safeTitle}</h1><div>${formatDate(note.createdAt)}</div><p>${safeContent}</p></body></html>`;
    const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadFile(html, `note-${slug}.html`, 'text/html');
    toast('📄 Downloading note…');
}

function exportSingleNoteAsDoc(note) {
    const lines = [note.title, '='.repeat(40), '', note.content];
    const slug = note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadFile(lines.join('\n'), `note-${slug}.txt`, 'text/plain');
    toast('📝 Downloading note…');
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._tid);
    el._tid = setTimeout(() => el.classList.remove('show'), 2400);
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
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
        }, 500);
    });

    document.addEventListener('mouseout', (e) => {
        if (!e.target.closest('[data-tooltip]')) return;
        clearTimeout(showTid);
        tip.classList.remove('visible');
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