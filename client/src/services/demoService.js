import api, { extractData } from './api';

export async function seedDemoWorkspace() {
  const response = await api.post('/demo/seed', {});
  return extractData(response);
}
