import EmailLogsTable from "@/components/EmailLogsTable";

export const metadata = {
    title: "Email Logs",
};

export default function EmailLogsPage() {
    return (
        <div className="min-h-screen">
            <h1 className="text-xl font-semibold mb-4">Email Logs</h1>
            <EmailLogsTable />
        </div>
    );
}
