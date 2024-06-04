import { z } from 'zod';

/*
    if a profession is selected, the skill level must have a value
*/
export const ProjectProfessionsSchema = z
	.object({
		it_supporter: z.enum(['on']).optional(),
		itSupporter_skill_level: z
			.string({ required_error: 'Du skal vælge et færdighedsniveau.' })
			.optional(),
		programmering: z.enum(['on']).optional(),
		programmering_skill_level: z
			.string({
				required_error: 'Du skal vælge et færdighedsniveau.'
			})
			.optional(),
		infrastruktur: z.enum(['on']).optional(),
		infrastruktur_skill_level: z
			.string({
				required_error: 'Du skal vælge et færdighedsniveau.'
			})
			.optional()
	})
	.superRefine(({ it_supporter, programmering, infrastruktur }, ctx) => {
		//if none of the enums are on
		if (!it_supporter && !programmering && !infrastruktur) {
			ctx.addIssue({
				code: 'custom',
				message: 'Du skal vælge mindst en færdighed.',
				path: ['it_supporter']
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Du skal vælge mindst en færdighed.',
				path: ['programmering']
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Du skal vælge mindst en færdighed.',
				path: ['infrastruktur']
			});
		}
	})
	.superRefine(({ it_supporter, itSupporter_skill_level }, ctx) => {
		if (it_supporter == 'on' && (!itSupporter_skill_level || itSupporter_skill_level == '')) {
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['itSupporter_skill_level']
			});
		}
	})
	.superRefine(({ programmering, programmering_skill_level }, ctx) => {
		if (programmering == 'on' && (!programmering_skill_level || programmering_skill_level == '')) {
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['programmering_skill_level']
			});
		}
	})
	.superRefine(({ infrastruktur, infrastruktur_skill_level }, ctx) => {
		if (infrastruktur == 'on' && (!infrastruktur_skill_level || infrastruktur_skill_level == '')) {
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['infrastruktur_skill_level']
			});
		}
	});
export const ProjectAuthorsSchema = z.array(
	z
		.object({
			user_id: z.number().gt(0), //greater than 0
			authority_level: z.number().gte(0) //greater than or equal to 0
		})
		.optional()
);

export const ProjectSchema = z.object({
	title: z.string().min(1, 'Title er påkrævet.').max(50, 'Title må ikke være mere end 50 tegn.'),
	description: z
		.string({ required_error: 'Beskrivelsen er påkrævet.' })
		.min(1, 'Beskrivelsener påkrævet.')
		.max(9999, 'Beskrivelse må ikke være mere end 500 tegn.'),
	project_root_id: z.number().optional(),
	project_fork_id: z.number().optional(),
	live: z.enum(['yes', 'no']),
	notes: z.string().max(9999, 'Noter må ikke være mere end 500 tegn.').optional(),
	it_supporter: z.enum(['on']).optional(),
	it_supporter_skill_level: z.string().max(50, 'Niveau må ikke være mere end 50 tegn.').optional(),
	programmering: z.enum(['on']).optional(),
	programmering_skill_level: z.string().max(50, 'Niveau må ikke være mere end 50 tegn.').optional(),
	infrastruktur: z.enum(['on']).optional(),
	infrastruktur_skill_level: z.string().max(50, 'Niveau må ikke være mere end 50 tegn.').optional(),
	course_length: z
		.string()
		.min(1, 'Du skal skrive hvor lang tid projektet tager.')
		.max(50, 'Course length må ikke være mere end 50 tegn.')
});

export function validateCustomObject(project: any): { success: boolean; errors?: any } {
	let errors: any = {};

	const { it_supporter, it_supporter_skill_level } = project;
	if (it_supporter && it_supporter_skill_level == '') {
		errors.it_supporter_skill_level = 'Du skal vælge et niveau for it-supporter';
	}

	const { programmering, programmering_skill_level } = project;
	if (programmering && programmering_skill_level == '') {
		errors.programmering_skill_level = 'Du skal vælge et niveau for programmering';
	}

	const { infrastruktur, infrastruktur_skill_level } = project;
	if (infrastruktur && infrastruktur_skill_level == '') {
		errors.infrastruktur_skill_level = 'Du skal vælge et niveau for infrastruktur';
	}

	if (!infrastruktur && !programmering && !it_supporter) {
		errors.it_supporter = 'Du skal vælge mindst en færdighed.';
		errors.programmering = 'Du skal vælge mindst en færdighed.';
		errors.infrastruktur = 'Du skal vælge mindst en færdighed.';
	}

	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
