export interface GraphData {
  labels: string[];
  datasets: Datasets[];
}

interface Datasets {
  label: string;
  data: any;
  backgroundColor: string | string[];
  hidden?: boolean;
}
