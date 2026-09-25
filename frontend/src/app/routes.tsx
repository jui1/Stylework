import { AppLayout } from "@/components/layout/AppLayout";
import { LeadDetailPage } from "@/pages/LeadDetailPage";
import { LeadListPage } from "@/pages/LeadListPage";
import { BrowserRouter, Route, Routes } from "react-router";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LeadListPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
