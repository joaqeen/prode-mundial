export default async function handler(req, res) {
  const response = await fetch(
    'https://lohaulelpyyhorkwdehu.supabase.co/functions/v1/sincronizar-partidos',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaGF1bGVscHl5aG9ya3dkZWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODk5MzMsImV4cCI6MjA5NDM2NTkzM30.vU24EQHoYOye40GCQp3cA3q56Toa3I0ln43JihvomUQ'
      }
    }
  )

  const data = await response.json()
  res.status(200).json(data)
}

gir