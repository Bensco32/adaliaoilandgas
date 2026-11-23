import { loadSettings } from "@/lib/settings";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";

export default function AdminProjectsPage() {
  const projects = loadSettings().projects;
  return <ProjectsEditor projects={projects} />;
}
