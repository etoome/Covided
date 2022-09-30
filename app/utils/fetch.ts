interface Response<T> {
  status: number;
  data?: T;
}

interface Params {
  method: "GET" | "POST";
  url: string;
  body?: object;
  cookies?: string;
}

export async function fetchData<T>({
  method,
  url,
  body,
  cookies,
}: Params): Promise<Response<T>> {
  try {
    const res = await fetch(url, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        cookie: cookies!,
      },
      body: body && JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    console.error(err);
    return { status: 500 };
  }
}
