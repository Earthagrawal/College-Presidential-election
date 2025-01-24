module vote_module {
    use std::string::String;
    use std::vector;
    use std::signer;
    use std::table::{Self, Table};

    /// Contestant struct representing voting candidate
    struct Contestant has store, drop, copy {
        name: String,
        roll_no: String,
        cgpa: u64
    }

    /// Vote resource to manage voting state
    struct VoteContract has key {
        contestants: vector<Contestant>,
        vote_counts: Table<String, u64>,
        is_voted: Table<String, bool>,
        is_contested: Table<String, bool>,
        owner: address
    }

    /// Initialize voting contract
    public fun init_vote_contract(account: &signer) {
        move_to(account, VoteContract {
            contestants: vector::empty(),
            vote_counts: table::new(),
            is_voted: table::new(),
            is_contested: table::new(),
            owner: signer::address_of(account)
        });
    }

    /// Add candidate - only by owner
    public entry fun add_candidate(
        account: &signer, 
        name: String, 
        roll_no: String, 
        cgpa: u64
    ) acquires VoteContract {
        let contract = borrow_global_mut<VoteContract>(signer::address_of(account));
        
        // Check only owner can add candidates
        assert!(signer::address_of(account) == contract.owner, 1);
        
        // Check not already contested
        assert!(!table::contains(&contract.is_contested, roll_no), 2);
        
        // Add contestant
        vector::push_back(&mut contract.contestants, Contestant { 
            name, 
            roll_no: copy(roll_no), 
            cgpa 
        });
        
        // Mark as contested
        table::add(&mut contract.is_contested, roll_no, true);
    }

    /// Vote for a candidate
    public entry fun vote(
        account: &signer, 
        candidate_roll_no: String, 
        voter_roll_no: String
    ) acquires VoteContract {
        let contract = borrow_global_mut<VoteContract>(signer::address_of(account));
        
        // Check voter hasn't voted before
        assert!(!table::contains(&contract.is_voted, voter_roll_no), 3);
        
        // Increment vote count
        if (!table::contains(&contract.vote_counts, candidate_roll_no)) {
            table::add(&mut contract.vote_counts, candidate_roll_no, 1);
        } else {
            let current_votes = table::borrow_mut(&mut contract.vote_counts, candidate_roll_no);
            *current_votes += 1;
        }
        
        // Mark voter as voted
        table::add(&mut contract.is_voted, voter_roll_no, true);
    }

    /// Determine winner
    public fun get_winner(account: &signer): Contestant acquires VoteContract {
        let contract = borrow_global<VoteContract>(signer::address_of(account));
        let contestants = &contract.contestants;
        let vote_counts = &contract.vote_counts;
        
        let winner: Contestant = Contestant { 
            name: std::string::utf8(b""), 
            roll_no: std::string::utf8(b""), 
            cgpa: 0 
        };
        let highest_votes = 0;
        
        let i = 0;
        while (i < vector::length(contestants)) {
            let candidate = vector::borrow(contestants, i);
            let votes = *table::borrow_with_default(vote_counts, candidate.roll_no, &0);
            
            if (votes > highest_votes) {
                winner = *candidate;
                highest_votes = votes;
            };
            
            i = i + 1;
        };
        
        winner
    }

    /// Get all contestants
    public fun get_contestants(account: &signer): vector<Contestant> acquires VoteContract {
        let contract = borrow_global<VoteContract>(signer::address_of(account));
        *&contract.contestants
    }

    #[test]
    fun test_voting_flow() {
        // Test implementation would go here
    }
}
