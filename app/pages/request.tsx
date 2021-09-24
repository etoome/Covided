import { NextPageContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { default as Error, RequestError } from "../components/Error";
import Layout from "../components/Layout";
import Table, { TablePropsColumn, TablePropsData } from "../components/Table";
import { MessageResponse, QueryResponse } from "../schema/Query";
import { fetchData } from "../utils/fetch";
import logged from "../utils/logged";

interface Props {
  cookies?: string;
}
interface Stats {
  command?: string;
  rowCount: number;
}

const Request = ({ cookies }: Props) => {
  const router = useRouter();

  const [error, setError] = useState<RequestError | undefined>();

  const [query, setQuery] = useState("");

  const [columns, setColumns] = useState<TablePropsColumn>([]);
  const [data, setData] = useState<TablePropsData>([]);
  const [stats, setStats] = useState<Stats>();

  function resetError() {
    setError(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetchData<QueryResponse | any>({
      method: "POST",
      url: `${process.env.API_URL}/query/custom`,
      body: { query },
      cookies,
    });

    if (res.status === 403) {
      router.push("/login?next=/request");
      return;
    }

    if (res.status !== 200) {
      setError({ code: res.status, message: res.data?.message });
      return;
    }
    resetError();

    const { rowCount, rows, command }: QueryResponse = res.data;

    if (!rowCount || rowCount < 0) {
      setColumns([]);
      setData([]);
      setStats({ rowCount: 0 });
      return;
    }

    setStats({ ...stats, command, rowCount });

    const c = [];
    for (const key in rows[0]) {
      if (Object.prototype.hasOwnProperty.call(rows[0], key)) {
        c.push({
          Header: key,
          accessor: key,
        });
      }
    }
    setColumns(c);
    setData(rows);
  }

  return (
    <Layout>
      <div className="mx-auto p-10 space-y-10">
        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="space-y-2 px-4 w-full">
            <textarea
              onChange={(e) => setQuery(e.target.value)}
              className="resize-h max-h-80 h-10 w-full"
            ></textarea>

            <div className="flex justify-center">
              <button type="submit" className="primary-button w-full">
                Execute
              </button>
            </div>
          </form>
        </div>

        <Table
          columns={columns}
          data={data}
          title={stats && `${stats.command} on ${stats.rowCount} rows`}
        />

        {error && (
          <Error
            code={error.code}
            message={error.message}
            resetError={resetError}
          />
        )}
      </div>
    </Layout>
  );
};

export default Request;

export async function getServerSideProps(ctx: NextPageContext) {
  if (logged(ctx)) {
    return {
      props: {
        cookies: ctx.req?.headers.cookie || "",
      },
    };
  }
  return {
    redirect: {
      destination: `/login?next=/request`,
      permanent: false,
    },
  };
}
