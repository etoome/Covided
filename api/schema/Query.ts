export interface CustomQuery {
  query: string;
}

export function isCustomQuery(query: CustomQuery): query is CustomQuery {
  return query && typeof query.query === "string";
}

export interface QueryResponse {
  command: string;
  rowCount: number;
  rows: any[];
}
