program timevault_main_9482.aleo;

struct VaultData:
    creator as address;
    recipient as address;
    ipfs_hash_part1 as field;
    ipfs_hash_part2 as field;
    unlock_time as u64;
    unlock_type as u8;
    vault_type as u8;
    is_unlocked as boolean;
    created_at as u64;

mapping vault_counter:
    key as u8.public;
    value as u64.public;

mapping vaults:
    key as u64.public;
    value as VaultData.public;

mapping user_vault_count:
    key as address.public;
    value as u64.public;

mapping user_vaults:
    key as field.public;
    value as u64.public;

function create_vault:
    input r0 as address.private;
    input r1 as field.private;
    input r2 as field.private;
    input r3 as u64.private;
    input r4 as u8.private;
    input r5 as u8.private;
    input r6 as u64.private;
    async create_vault self.caller r0 r1 r2 r3 r4 r5 r6 into r7;
    output r7 as timevault_main_9482.aleo/create_vault.future;

finalize create_vault:
    input r0 as address.public;
    input r1 as address.public;
    input r2 as field.public;
    input r3 as field.public;
    input r4 as u64.public;
    input r5 as u8.public;
    input r6 as u8.public;
    input r7 as u64.public;
    get.or_use vault_counter[0u8] 0u64 into r8;
    add r8 1u64 into r9;
    set r9 into vault_counter[0u8];
    cast r0 r1 r2 r3 r4 r5 r6 false r7 into r10 as VaultData;
    set r10 into vaults[r9];
    get.or_use user_vault_count[r0] 0u64 into r11;
    hash.bhp256 r0 into r12 as field;
    hash.bhp256 r11 into r13 as field;
    add r12 r13 into r14;
    set r9 into user_vaults[r14];
    add r11 1u64 into r15;
    set r15 into user_vault_count[r0];
    is.neq r1 r0 into r16;
    branch.eq r16 false to end_then_0_0;
    get.or_use user_vault_count[r1] 0u64 into r17;
    hash.bhp256 r1 into r18 as field;
    hash.bhp256 r17 into r19 as field;
    add r18 r19 into r20;
    set r9 into user_vaults[r20];
    add r17 1u64 into r21;
    set r21 into user_vault_count[r1];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;

function unlock_vault:
    input r0 as u64.private;
    input r1 as u64.private;
    async unlock_vault self.caller r0 r1 into r2;
    output r2 as timevault_main_9482.aleo/unlock_vault.future;

finalize unlock_vault:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    get vaults[r1] into r3;
    assert.eq r3.is_unlocked false;
    is.eq r3.recipient r0 into r4;
    is.eq r3.creator r0 into r5;
    or r4 r5 into r6;
    assert.eq r6 true;
    gte r2 r3.unlock_time into r7;
    assert.eq r7 true;
    cast r3.creator r3.recipient r3.ipfs_hash_part1 r3.ipfs_hash_part2 r3.unlock_time r3.unlock_type r3.vault_type true r3.created_at into r8 as VaultData;
    set r8 into vaults[r1];

constructor:
    assert.eq edition 0u16;
