"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import styles from "../../admin-lessons.module.css";
import CourseBuilderSidebar from "../../CourseBuilderSidebar";

export default function LessonBuilderClient({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [uploading, setUploading] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState<number | null>(null);
  const [moduleOrder, setModuleOrder] = useState<number | null>(null);

  useEffect(() => {
    async function loadBuilder() {
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}/builder`);
        if (!response.ok) return;
        const data = await response.json();
        setLessonTitle(data.lesson.title);
        setLessonOrder(data.lesson.order);
        setModuleTitle(data.module.title);
        setModuleOrder(data.module.order);
      } catch (error) {
        console.error(error);
      }
    }
    loadBuilder();
  }, [lessonId]);

  async function uploadDoc(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`/api/admin/lessons/${lessonId}/materials`, { method: "POST", body: form });
    alert(response.ok ? "Document uploaded" : "Document upload failed");
  }

  async function uploadVideo(file: File) {
    setUploading(true);
    try {
      const blob = await upload(`lesson-videos/${file.name}`, file, {
        access: "public", handleUploadUrl: "/api/admin/video-upload", multipart: true,
      });
      const response = await fetch(`/api/admin/lessons/${lessonId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blob.url, title: file.name, mimeType: file.type, sizeBytes: file.size }),
      });
      if (!response.ok) throw new Error("Could not save the uploaded video");
      alert("Video uploaded");
    } catch (error) {
      console.error(error);
      alert("Video upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.builderShell}>
      <CourseBuilderSidebar courseId={courseId} onAddThumbnail={() => {}} onAddOverview={() => {}} onAddObjectives={() => {}} onAddModule={() => {}} onAddCertification={() => {}} />
      <main className={styles.builderMain}>
        <div className={styles.lessonBuilderCard}>
          <button className={styles.closeBuilder} onClick={() => history.back()}>✕</button>
          <div className={styles.builderMeta}>
            <div><span>Module {moduleOrder}</span> {moduleTitle}</div>
            <div><span>Lesson {lessonOrder}</span> {lessonTitle}</div>
          </div>
          <h2>Lesson Builder</h2>
          <div className={styles.lessonBuilderGrid}>
            <label className={styles.builderAction}>
              Upload DOC
              <input type="file" hidden accept=".doc,.docx,.pdf" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadDoc(file);
              }} />
            </label>
            <label className={styles.builderAction}>
              {uploading ? "Uploading Video…" : "Upload Video"}
              <input type="file" hidden disabled={uploading} accept="video/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadVideo(file);
              }} />
            </label>
          </div>
        </div>
      </main>
    </div>
  );
}
