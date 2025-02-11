import Navbar from "./components/Navbar";
import TableEditor from "./components/TableEditor";
import CSVUploader from "./components/CSVtoAPI";

export default function Home() {
  return (
    <div>
      <Navbar />
      <TableEditor />
      <CSVUploader />
    </div>
  );
}
