<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-8 text-center font-display">
        Dernières Créations Partagées
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Real PDFs -->
        <PdfCard
          v-for="pdf in pdfs"
          :key="pdf.id"
          :pdf="pdf"
          @download="downloadPdf"
        />
        
        <!-- Fallback example PDFs if no real data -->
        <div v-if="!pdfs || pdfs.length === 0" class="col-span-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PdfCard
              v-for="example in examplePdfs"
              :key="example.id"
              :pdf="example"
              :is-example="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Pdf {
  id: string
  personnageNom: string
  systemeJeu: string
  auteurNom: string
  dateCreation: string
  nombreTelechargements?: number
}

interface Props {
  pdfs?: Pdf[]
}

const props = defineProps<Props>()

// Example PDFs for fallback (Mist Engine only)
const examplePdfs = [
  {
    id: 'example-1',
    personnageNom: 'Elena Voss',
    systemeJeu: 'Mist Engine',
    auteurNom: 'Alex M.',
    dateCreation: '2024-01-15',
    nombreTelechargements: 23
  },
  {
    id: 'example-2',
    personnageNom: 'Marcus Kane',
    systemeJeu: 'Mist Engine',
    auteurNom: 'Marie L.',
    dateCreation: '2024-01-12',
    nombreTelechargements: 31
  },
  {
    id: 'example-3',
    personnageNom: 'Akira Tanaka',
    systemeJeu: 'Mist Engine',
    auteurNom: 'Pierre K.',
    dateCreation: '2024-01-10',
    nombreTelechargements: 18
  }
]

const downloadPdf = async (pdfId: string) => {
  try {
    // Call PDF download API
    await $fetch(`/api/pdf/download/${pdfId}`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
  }
}
</script>