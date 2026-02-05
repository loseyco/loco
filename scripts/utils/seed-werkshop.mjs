import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

async function seedWerkShop() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const projectId = 'b63adf3c-0e06-4883-8429-910301580bf2';

    console.log('Updating project details...');
    await client.query(`
      UPDATE projects SET 
        progress_percent = 65,
        estimated_completion = '2026-08-15',
        make = 'BMW',
        model = '3.0 CS',
        year = '1973',
        chassis_number = '2262554',
        owner_name = 'M. Kaufmann'
      WHERE id = $1
    `, [projectId]);

    console.log('Seeding milestones...');
    const milestones = [
      {
        title: "Intake & Assessment",
        description: "Full vehicle inspection, documentation of original parts, and restoration plan finalization.",
        status: "completed",
        target_date: "2025-10-12",
        details: JSON.stringify(["Numbers matching verification", "Rust assessment", "Parts inventory"]),
        order_index: 1
      },
      {
        title: "Disassembly",
        description: "Complete strip-down to bare metal. Cataloging and storage of all components.",
        status: "completed",
        target_date: "2025-11-05",
        details: JSON.stringify(["Engine removal", "Interior removal", "Glass & Trim storage"]),
        order_index: 2
      },
      {
        title: "Metal Work & Fabrication",
        description: "Rust repair, panel replacement, and body alignment on the Celette jig.",
        status: "completed",
        target_date: "2026-01-15",
        details: JSON.stringify(["Floor pan replacement", "Quarter panel repair", "Structural reinforcement"]),
        order_index: 3
      },
      {
        title: "Body & Paint",
        description: "Block sanding, priming, and application of the original Fjord Blue Metallic finish.",
        status: "current",
        target_date: "2026-03-01",
        details: JSON.stringify(["Surface leveling", "Epoxy priming", "Color matching"]),
        order_index: 4
      },
      {
        title: "Mechanical Restoration",
        description: "Full rebuild of the M30 straight-six, suspension, and drivetrain components.",
        status: "pending",
        target_date: "2026-05-01",
        details: JSON.stringify(["Engine rebuild", "Suspension powder coating", "Brake system overhaul"]),
        order_index: 5
      },
      {
        title: "Final Assembly",
        description: "Installation of interior, glass, trim, and mechanical systems.",
        status: "pending",
        target_date: "2026-07-01",
        details: JSON.stringify(["Leather upholstery", "Wiring harness installation", "Chrome trim fitment"]),
        order_index: 6
      }
    ];

    for (const m of milestones) {
      await client.query(`
        INSERT INTO project_milestones (project_id, title, description, status, target_date, details, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [projectId, m.title, m.description, m.status, m.target_date, m.details, m.order_index]);
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seedWerkShop();
