require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Checking for projects with Accepted/Awarded bids but incorrect status...')
  
  // Find all projects that are currently 'Bidding' or 'Published'
  const projects = await prisma.project.findMany({
    where: {
      status: {
        in: ['Bidding', 'Published']
      }
    },
    include: {
      bids: true
    }
  })

  console.log(`Found ${projects.length} active projects to check.`)

  for (const p of projects) {
    // Check if any bid is Accepted or Awarded
    const acceptedBid = p.bids.find(b => b.status === 'Accepted' || b.status === 'Awarded')
    
    if (acceptedBid) {
      console.log(`Project ${p.id} ("${p.title}") has accepted bid ${acceptedBid.id}. Status is "${p.status}". Updating to "Awarded"...`)
      
      try {
        await prisma.project.update({
          where: { id: p.id },
          data: { status: 'Awarded' }
        })
        console.log(`✅ Updated Project ${p.id} to Awarded.`)
      } catch (e) {
        console.error(`❌ Failed to update Project ${p.id}:`, e.message)
      }
    }
  }
  
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
