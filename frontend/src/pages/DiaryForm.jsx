import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const initial = {
  center_id: "MDA-CENTER-1",
  date: new Date().toISOString().slice(0,10),
  prepared_by: { name: "", volunteer_id: "" },
  total_enrolled: 0,
  present_count: 0,
  in_time: "",
  out_time: "",
  daily_checklist: {
    students_wore_id: false,
    volunteers_wore_id: false,
    footwear_placed: false,
    opening_prayer: false,
    thought_explained: false,
    physical_activity: false,
    closing_prayer: false
  },
  volunteer_reports: [{ volunteer_name: "", volunteer_id: "", in_time:"", out_time:"", subject_taught:"", topic:"", homework:"", students_present:0 }],
  attendance_list: [],
  remarks: "",
  signature: ""
};

export default function DiaryForm({ token }) {
  const [diary, setDiary] = useState(() => {
    try { return JSON.parse(localStorage.getItem("diary_draft")) || initial; } catch { return initial; }
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("diary_draft", JSON.stringify(diary));
  }, [diary]);

  function setField(path, value) {
    setDiary(d => {
      const copy = JSON.parse(JSON.stringify(d));
      const parts = path.split(".");
      let cur = copy;
      for (let i=0;i<parts.length-1;i++) cur = cur[parts[i]];
      cur[parts[parts.length-1]] = value;
      return copy;
    });
  }

  const addVolunteer = () => setDiary(d => ({ ...d, volunteer_reports: [...d.volunteer_reports, { volunteer_name:"", volunteer_id:"", in_time:"", out_time:"", subject_taught:"", topic:"", homework:"", students_present:0 }] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(diary)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      localStorage.removeItem("diary_draft");
      // assume API returns saved diary with id or filePending
      const id = data.id || data.file || Date.now();
      navigate(`/diary/preview/${encodeURIComponent(id)}`, { state: { diary: data.savedDiary || diary }});
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="diary-form container">
      <h2>UPAY Daily Diary — Fill</h2>
      <form onSubmit={handleSubmit}>
        <label>Date <input value={diary.date} onChange={e=>setField("date", e.target.value)} /></label>
        <label>Center id <input value={diary.center_id} onChange={e=>setField("center_id", e.target.value)} /></label>
        <label>Prepared by (name) <input value={diary.prepared_by.name} onChange={e=>setField("prepared_by.name", e.target.value)} /></label>
        <label>Prepared by (id) <input value={diary.prepared_by.volunteer_id} onChange={e=>setField("prepared_by.volunteer_id", e.target.value)} /></label>

        <label>Total enrolled <input type="number" value={diary.total_enrolled} onChange={e=>setField("total_enrolled", Number(e.target.value)||0)} /></label>
        <label>Present count <input type="number" value={diary.present_count} onChange={e=>setField("present_count", Number(e.target.value)||0)} /></label>
        <label>In time <input value={diary.in_time} onChange={e=>setField("in_time", e.target.value)} /></label>
        <label>Out time <input value={diary.out_time} onChange={e=>setField("out_time", e.target.value)} /></label>

        <h4>Daily checklist</h4>
        {Object.keys(diary.daily_checklist).map(k => (
          <label key={k}>
            <input type="checkbox" checked={diary.daily_checklist[k]} onChange={e=>setField(`daily_checklist.${k}`, e.target.checked)} />
            {k.replace(/_/g," ")}
          </label>
        ))}

        <h4>Volunteer reports</h4>
        {diary.volunteer_reports.map((v,i)=>(
          <div key={i} className="vol-row">
            <input placeholder="Name" value={v.volunteer_name} onChange={e=>setField(`volunteer_reports.${i}.volunteer_name`, e.target.value)} />
            <input placeholder="ID" value={v.volunteer_id} onChange={e=>setField(`volunteer_reports.${i}.volunteer_id`, e.target.value)} />
            <input placeholder="In" value={v.in_time} onChange={e=>setField(`volunteer_reports.${i}.in_time`, e.target.value)} />
            <input placeholder="Out" value={v.out_time} onChange={e=>setField(`volunteer_reports.${i}.out_time`, e.target.value)} />
            <input placeholder="Subject" value={v.subject_taught} onChange={e=>setField(`volunteer_reports.${i}.subject_taught`, e.target.value)} />
            <input placeholder="Topic" value={v.topic} onChange={e=>setField(`volunteer_reports.${i}.topic`, e.target.value)} />
            <input placeholder="Homework" value={v.homework} onChange={e=>setField(`volunteer_reports.${i}.homework`, e.target.value)} />
            <input placeholder="Students" type="number" value={v.students_present} onChange={e=>setField(`volunteer_reports.${i}.students_present`, Number(e.target.value)||0)} />
          </div>
        ))}
        <button type="button" onClick={addVolunteer}>Add volunteer</button>

        <label>Remarks<textarea value={diary.remarks} onChange={e=>setField("remarks", e.target.value)} /></label>
        <label>Signature<input value={diary.signature} onChange={e=>setField("signature", e.target.value)} /></label>

        <div>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save & Preview"}</button>
        </div>
      </form>
    </div>
  );
}
