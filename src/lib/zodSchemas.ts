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
	// subjects: z
	// 	.string({ required_error: 'Fag er påkrævet.' })
	// 	.min(1, 'Fag er påkrævet.')
	// 	.max(500, 'Emner må ikke være mere end 500 tegn.'),
	// resources: z
	// 	.string({ required_error: 'Resurcer er påkrævet.' })
	// 	.min(1, 'Resurcer er påkrævet.')
	// 	.max(500, 'Ressourcer må ikke være mere end 500 tegn.'),
	title: z.string().min(1, 'Title er påkrævet.'),
	description: z
		.string({ required_error: 'Beskrivelsen er påkrævet.' })
		.min(1, 'Beskrivelsener påkrævet.')
		.max(500, 'Beskrivelse må ikke være mere end 500 tegn.'),
	// professions: ProjectProfessionsSchema,
	// authors: ProjectAuthorsSchema,
	project_root_id: z.number().optional(),
	project_fork_id: z.number().optional(),
	live: z.enum(['yes', 'no']),

	it_supporter: z.enum(['on']).optional(),
	it_supporter_skill_level: z.string().optional(),
	programmering: z.enum(['on']).optional(),
	programmering_skill_level: z.string().optional(),
	infrastruktur: z.enum(['on']).optional(),
	infrastruktur_skill_level: z.string().optional()
});
