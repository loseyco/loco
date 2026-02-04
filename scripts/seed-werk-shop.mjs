import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  // 1. Create Project
  const { data: project, error: pError } = await supabase
    .from('projects')
    .insert({
      name: "The Werk Shop - BMW 3.0 CS Restoration",
      description: "Complete restoration of a 1973 BMW 3.0 CS (Chassis #2262554) for M. Kaufmann.",
      status: "active",
      client: "M. Kaufmann",
      metadata: {
        make: "BMW",
        model: "3.0 CS",
        year: "1973",
        chassis: "2262554"
      }
    })
    .select()
    .single();

  if (pError) {
    console.error('Error creating project:', pError);
    return;
  }

  console.log('Project created:', project.id);

  // 2. Create Timeline Notes (as project_notes)
  const timeline = [
    {
      author: "Artisan Team",
      content: "[STAGE: COMPLETED] Intake & Assessment: Full vehicle inspection, documentation of original parts, and restoration plan finalization. Verified: Numbers matching, Rust assessment, Parts inventory.",
      project_id: project.id
    },
    {
      author: "Artisan Team",
      content: "[STAGE: COMPLETED] Disassembly: Complete strip-down to bare metal. Cataloging and storage of all components. Verified: Engine removal, Interior removal, Glass & Trim storage.",
      project_id: project.id
    },
    {
      author: "Artisan Team",
      content: "[STAGE: COMPLETED] Metal Work & Fabrication: Rust repair, panel replacement, and body alignment on the Celette jig. Verified: Floor pan replacement, Quarter panel repair, Structural reinforcement.",
      project_id: project.id
    },
    {
      author: "Artisan Team",
      content: "[STAGE: CURRENT] Body & Paint: Block sanding, priming, and application of the original Fjord Blue Metallic finish. Active: Surface leveling, Epoxy priming, Color matching.",
      project_id: project.id
    }
  ];

  const { error: nError } = await supabase
    .from('project_notes')
    .insert(timeline);

  if (nError) console.error('Error creating notes:', nError);
  else console.log('Timeline notes seeded.');
}

seed();
