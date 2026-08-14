import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CredentialTable     from '@/Components/EmailCredentials/CredentialTable';
import CredentialFormModal from '@/Components/EmailCredentials/CredentialFormModal';
import AiUsageMatrixModal  from '@/Components/EmailCredentials/AiUsageMatrixModal';
import AiAgentsList        from '@/Components/EmailCredentials/AiAgentsList';

/**
 * Email Credentials index page.
 *
 * Owns only modal open/close state and passes the right props down.
 * All UI and logic lives in the three sub-components.
 */
export default function Index({ auth, credentials, platforms }) {

    // ── Credential form modal (create / edit) ─────────────────────────────────
    const [formModal, setFormModal]       = useState(false);
    const [editTarget, setEditTarget]     = useState(null);   // null = create mode

    const openCreate = () => { setEditTarget(null); setFormModal(true); };
    const openEdit   = (row) => { setEditTarget(row); setFormModal(true); };
    const closeForm  = () => { setFormModal(false); setEditTarget(null); };

    // ── AI usage matrix modal ─────────────────────────────────────────────────
    const [usageModal, setUsageModal]     = useState(false);
    const [usageTarget, setUsageTarget]   = useState(null);   // credential row

    const openUsage  = (row) => { setUsageTarget(row); setUsageModal(true); };
    const closeUsage = () => { setUsageModal(false); setUsageTarget(null); };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Email Credentials" />

            <div className="space-y-6">
                <CredentialTable
                    credentials={credentials}
                    onAdd={openCreate}
                    onEdit={openEdit}
                    onUsage={openUsage}
                />

                {/* AI platforms listing — shows which emails are on each platform */}
                <AiAgentsList
                    platforms={platforms}
                    credentials={credentials}
                    onUsage={openUsage}
                />
            </div>

            {/* Create / Edit modal */}
            <CredentialFormModal
                show={formModal}
                onClose={closeForm}
                initial={editTarget}
                platforms={platforms}
            />

            {/* AI monthly usage matrix modal */}
            <AiUsageMatrixModal
                show={usageModal}
                onClose={closeUsage}
                credential={usageTarget}
                platforms={platforms}
            />
        </AuthenticatedLayout>
    );
}
