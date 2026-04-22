COMPANION TO THE OIA MODEL --- READER\'S DIGEST

Decision Log

Digest

The Eleven Decisions Most Worth Weighing In On

Agentics Foundation · 2026

Purpose

This is a compressed version of the OIA Model\'s full Decision Log, intended to be read alongside the Reader\'s Digest. It captures the eleven decisions that most shape the architecture --- the ones reviewers are most likely to want to re-open, and the ones whose answer determines how the rest of the document reads.

The full Decision Log records thirty decisions across five sections: naming, structure, editorial voice, explicit deferrals, and design. Reviewers who want the complete set should consult the full log. The eleven decisions here are the subset that would most benefit from external challenge before the next round of revisions. Design decisions --- on fonts, typography, and layout --- are omitted from this digest; they sit in the full log for readers interested in that level of detail.

Each decision is stated with its rationale in a single paragraph. Where a specific condition would cause us to reopen the decision, the condition is named explicitly as a revisit trigger. Reviewers who disagree with a decision should point at it by number.

I. Naming

01 **The model is called the OIA Model --- Open Intelligence Architecture.**

Earlier iterations proposed Sovereign Agentic Architecture (SAA) and Sovereign Agentic Architecture Reference (SAAR). Both front-loaded the sovereign and agentic qualifiers into the name itself, which bakes in a moment-in-time framing: today\'s intelligent systems happen to be agentic, and sovereignty is a pressing concern in today\'s regulatory climate, but reference models that over-commit to the vocabulary of their publication moment age poorly. OSI did not put packet-switched or IP-era in its name. A durable reference architecture names its domain (intelligence) and its posture (open), and leaves the current properties of that domain --- agentic, sovereign, autonomous, persistent --- to live in the body of the document where they can be refined as the domain evolves.

*Revisit trigger.* Strong evidence that Open Intelligence Architecture has an existing specific usage in a related domain that would create confusion.

02 **Layer 8 is called the Continuity Fabric.**

This name was chosen after iterating through four candidates: Cognitive Substrate, Cognitive Core, Cognitive Container, and finally Continuity Fabric. Cognitive Substrate was rejected because it forced an architectural symmetry with Layer 3 (Agent Data Substrate) that the layer does not actually have --- Layer 3 is a foundation that persists data for other layers to consume, while Layer 8 is an active layer that maintains continuity through change. Core was rejected as self-aggrandising. Container was rejected as brand-captured --- RuVector\'s RVF technology uses container framing, and layer names should not shade toward any contributor\'s product vocabulary. Continuity Fabric names what the layer does rather than what it contains: it provides continuity --- of memory, of learning, of judgment, of identity --- through the transitions the rest of the stack undergoes.

*Revisit trigger.* A better name that preserves both the active-layer quality and the continuity-through-change function. Fabric is the weakest component of the name if any word is.

03 **The asymmetry between Layers 3 and 8 is an architectural feature, not an awkwardness.**

Several drafts attempted to produce symmetric names for the two state-holding layers. All of them either forced Layer 8 into a substrate framing that misrepresents its function, or pulled Layer 3 toward a fabric framing that overstates its activity. The final decision is to let the asymmetry stand and explain it in the body of the document. Readers who notice the asymmetry and ask why are asking the right question, and the document has a good answer.

II\. Structure

04 **Nine layers, not seven or twelve.**

The number of layers is the single most consequential structural decision. Seven would have mapped more cleanly to OSI, which has rhetorical advantages, but would have forced the concerns of intelligent systems into fewer positions than they naturally occupy --- specifically, either the continuity fabric or the training and adaptation layer would have had to be folded into an adjacent layer, and both have structural requirements that cannot be localised into another layer without displacement. Twelve would have allowed finer distinctions but would have made the model less memorable, less teachable, and harder to adopt. Nine is the smallest number that gives each distinct architectural concern a structural home without forced merging.

05 **State-holding layers bracket the operational layers.**

Layer 3 (Agent Data Substrate) and Layer 8 (Continuity Fabric) sit on either side of the operational layers (4 through 7). The pairing is architecturally deliberate: the operational layers depend on both forms of state (data and cognitive), and locating one state-holding layer below the operational layers and one above them makes the bidirectional dependency structurally visible. An alternative would have been to place both state-holding layers at adjacent positions, but this would have produced a model where the operational layers depended on state only below them, misrepresenting how intelligent systems actually work.

06 **Cross-layer concerns are a separate section, not distributed into each layer.**

Six classes of concern --- security, sovereignty, auditability, identity, energy, provenance --- cut across multiple layers. They could have been addressed by adding a cross-cutting subsection to every layer definition. We chose instead to address them in a single section and reference individual layer treatments from there. The reason is honesty about which concerns are genuinely layered and which are genuinely cross-cutting. Distributing them into each layer produces the illusion that they are layered concerns with local treatments, which invites the failure modes of displacement and omission. A separate section marks them as genuinely cross-cutting and creates space to treat their interactions.

07 **Each layer ends with Open Questions.**

Every layer definition closes with a subsection naming architectural issues on which consensus has not yet emerged. Reference architectures that present themselves as complete invite criticism by claiming more certainty than the domain supports. Naming open questions explicitly signals intellectual honesty, creates the conditions for community contribution, and --- importantly --- gives reviewers a structured place to push back without challenging the whole layer definition. Reviewers who disagree with how a layer addresses a concern can propose that the disagreement belongs in Open Questions rather than requiring the layer to be rewritten.

III\. Editorial Voice

08 **Institutional third-person voice throughout, with the Foreword as the one exception.**

The voice is the voice of the Agentics Foundation, not of any individual contributor. This is parallel to ISO and NIST publications, which do not read as the work of named authors. Institutional voice prevents the document from being read as a single person\'s opinion and signals that the model is published by an organisation --- which is what gives reference architectures their durability. The Foreword is the one exception, written in Reuven\'s voice, which establishes the why-now framing with direct personal authority that the body of the document could not do without breaking its institutional voice. Editorial discipline throughout the rest of the document depends on keeping the Foreword\'s personal register from leaking past the page break.

09 **No Cognitum, Snapper, or ACIUM branding in the body of the document.**

This decision was made explicitly and applied retroactively after it was identified. The rationale is structural credibility: a reference architecture published by the Agentics Foundation loses force if its body reads as a vehicle for the founder\'s commercial ventures. Cognitum, Snapper, and ACIUM are consequential at specific layers --- Layer 8, Layer 7, and the cross-layer security and identity spans respectively --- and their absence from the body is not neutrality. It is institutional discipline. They will appear in future publications where appropriate: adoption case studies, a separately authored implementation guide, or vendor-specific reference architectures that cite the OIA Model.

10 **The document is correctly opinionated where evidence supports it.**

Neutrality to the point of naming all alternatives with equal weight is itself a form of misrepresentation when the domain has converged. The Model Context Protocol is named as the dominant contemporary interoperability protocol at Layer 7 because it is. WebAssembly is named as architecturally consequential at Layer 1 because it is. Provider vertical extension into Layers 6, 7, and 8 is named as a consequential pattern with sovereignty implications because it is. Softening these statements for false balance would weaken the document. Anthropic is mentioned naturally across multiple layers, not avoided for optical neutrality --- the document mentions competitors at comparable frequency where they are relevant. Balance comes from accuracy across the domain, not from artificial avoidance of any single vendor. Where the domain has not converged, the document says so through the Open Questions mechanism.

IV\. Explicit Deferrals

11 **Four things are deliberately deferred to future work.**

The first draft is intentionally incomplete in four specific places, and the incompleteness is principled rather than expedient.

The maturity model --- how organisations progress through adopting the architecture --- is a separate document with different intellectual foundations (the Christensen and Moore disruption-theory lineage, the CMMI tradition, adoption-curve frameworks). Conflating a reference architecture with a maturity model would weaken both. The architectural diagram is described at Section 3 but not yet produced, and will appear in the illustrated edition after the first round of review. The Appendix acknowledging contributors will be completed after community review closes. And several References entries are flagged as requiring verification against current published sources before any formal publication.

These deferrals are not evidence of an unfinished first draft. They are evidence that the draft has a clear sense of what belongs in a first version and what belongs in subsequent ones. Reviewers are encouraged to flag any additional work they believe should be deferred --- or, conversely, to argue that something currently deferred should have been included.

On Using This Log

These are not the only decisions made during drafting. They are the decisions most worth the team\'s attention, and the ones whose answers shape how the rest of the document reads. The full Decision Log records thirty decisions in total and is available as a companion for anyone who wants the complete set.

Reviewers who disagree with a specific decision are encouraged to point at it by number. A comment of the form reopen decision 04, because... is more productive than marginalia on the layer definitions would be, because it addresses the underlying choice rather than its surface expression. Decisions that are reopened and changed will be re-recorded with the change noted and the previous rationale preserved. Decisions that are reopened and confirmed will be so noted, so the log captures not only what was decided but what has been challenged and held.

AGENTICS FOUNDATION

Decision Log Digest

Companion to the Reader\'s Digest · 2026
