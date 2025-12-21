import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { URLS, ImageUrl } from "../../Urls";
import {
  Mail,
  University,
  MapPin,
  User,
} from "lucide-react";

const tabs = [
  "Journal Home",
  "Editorial Board",
  "Abstracting and Indexing",
  "Guidelines",
  "Articles Inpress",
  "Current Issue",
  "Archive Page",
];

const JournalHome = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Journal Home");
  const [editors, setEditors] = useState<any[]>([]);
  const [editorsLoading, setEditorsLoading] = useState(false);
  const [editorsError, setEditorsError] = useState("");
  const [journal, setJournal] = useState<any>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    const jid = searchParams.get("jid");
    const token = localStorage.getItem("authToken") || "";
    setJournalLoading(true);
    setJournalError("");
    fetch(URLS.USERS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: any[] = [];
        if (result?.data && Array.isArray(result.data)) {
          list = result.data.filter((x: any) => x.role === "journal");
        } else if (Array.isArray(result)) {
          list = result.filter((x: any) => x.role === "journal");
        }
        let found =
          list.find((x: any) => String(x._id) === String(id)) ||
          list.find((x: any) => String(x.journalId) === String(jid)) ||
          null;
        setJournal(found);
        if (!found) setJournalError("Journal not found");
      })
      .catch(() => {
        setJournalError("Failed to load journal");
        setJournal(null);
      })
      .finally(() => setJournalLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    setEditorsLoading(true);
    setEditorsError("");

    fetch(URLS.EDITORS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: any[] = [];
        if (Array.isArray(result)) list = result;
        else if (result && Array.isArray(result?.data)) list = result.data;
        if (journal?._id) {
          list = list.filter((e: any) => {
            if (typeof e.journalId === "object" && e.journalId) {
              return String(e.journalId._id) === String(journal._id);
            }
            return String(e.journalId) === String(journal._id);
          });
        }
        setEditors(list);
      })
      .catch(() => {
        setEditorsError("Failed to load editors");
        setEditors([]);
      })
      .finally(() => setEditorsLoading(false));
  }, [journal]);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section
        className="relative h-[180px] sm:h-[220px] md:h-[260px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url('${
            journal?.journalBgImage
              ? `${ImageUrl}${journal.journalBgImage}`
              : journal?.journalImage
              ? `${ImageUrl}${journal.journalImage}`
              : "/journal-hero.jpg"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {journal?.journalTitle || journal?.journalName || "Journal"}
          </h1>

          <p className="mt-2 text-white/90 text-sm md:text-base">
            Open Access Journal
          </p>

          <span className="absolute right-4 bottom-4 md:right-8 md:bottom-6 text-white font-semibold">
            {journal?.journalISSN ? `ISSN: ${journal.journalISSN}` : ""}
          </span>
        </div>
      </section>

      {/* TABS */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Tabs */}
          <div className="hidden md:flex flex-wrap gap-2 py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-medium border transition-all
                  ${
                    activeTab === tab
                      ? "bg-[#00467F] text-white border-[#00467F]"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-[#00467F]/10 hover:text-[#00467F]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium border transition-all
                  ${
                    activeTab === tab
                      ? "bg-[#00467F] text-white border-[#00467F]"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-[#00467F]/10 hover:text-[#00467F]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* JOURNAL HOME */}
        {activeTab === "Journal Home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              {journalLoading && (
                <div className="text-sm text-gray-500">Loading journal...</div>
              )}
              {journalError && (
                <div className="text-sm text-red-600">{journalError}</div>
              )}
              {!journalLoading && !journalError && journal?.journalDescription ? (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: journal.journalDescription }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  No description available.
                </p>
              )}
            </div>
            <img
              src={
                journal?.journalImage
                  ? `${ImageUrl}${journal.journalImage}`
                  : journal?.journalImage
                  ? `${ImageUrl}${journal.journalImage}`
                  : "/journal-hero.jpg"
              }
              alt="Journal"
              className="w-full rounded-xl border border-gray-200 shadow-sm object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/640x420?text=Journal+Image";
              }}
            />
          </div>
        )}

        {/* EDITORIAL BOARD */}
        {activeTab === "Editorial Board" && (
          <div className="space-y-6">
            {editorsLoading && (
              <p className="text-sm text-gray-500">Loading editors...</p>
            )}

            {editorsError && (
              <p className="text-sm text-red-600">{editorsError}</p>
            )}

            {!editorsLoading && !editorsError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {editors.map((e, idx) => (
                  <div
                    key={e._id ?? idx}
                    className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="h-1.5 bg-[#00467F] rounded-t-xl" />

                    <div className="p-5 flex flex-col gap-3">
                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#00467F]" />
                        <h3 className="font-semibold text-[#031E40]">
                          {e.editorName || "-"}
                        </h3>
                      </div>

                      {/* Designation */}
                      <p className="text-sm font-medium text-[#00467F]">
                        {e.designation || "-"}
                      </p>

                      {/* Institution */}
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <University className="h-4 w-4 mt-0.5 text-gray-500" />
                        <span>{e.institution || "-"}</span>
                      </div>

                      {/* Country */}
                      {e.country && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{e.country}</span>
                        </div>
                      )}

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${e.email}`}
                          className="text-[#00467F] hover:underline break-all"
                        >
                          {e.email || "-"}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {editors.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No editors available.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab !== "Journal Home" &&
          activeTab !== "Editorial Board" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#031E40] mb-2">
                {activeTab}
              </h3>
              <p className="text-sm text-gray-600">
                Content for <strong>{activeTab}</strong> will appear here.
              </p>
            </div>
          )}
      </section>
    </div>
  );
};

export default JournalHome;
