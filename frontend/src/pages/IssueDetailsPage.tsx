import { useParams } from "react-router-dom";

export default function IssueDetailsPage() {
  const { issueNumber } = useParams();

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-950">Issue details</h2>

      <p className="mt-2 text-slate-500">Issue number: {issueNumber}</p>
    </section>
  );
}
