define(['jquery', 'core/ajax', 'core/notification'], function($, ajax, notification) {
    
    return {
        init: function(courseid) {
            $('.update-status-btn').on('click', function() {
                var btn = $(this);
                var requestId = btn.data('requestid');
                var newStatus = $('#select-' + requestId).val();
                
                // Disable button to prevent double submission
                btn.prop('disabled', true);
                
                fetch(M.cfg.wwwroot + '/local/securecoursehub/ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'update_status',
                        id: requestId,
                        status: newStatus,
                        courseid: courseid,
                        sesskey: M.cfg.sesskey
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.error || 'Request failed'); });
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.success) {
                        $('#status-' + requestId).text(result.newstatus);
                        // Optional: show a small success message
                        console.log("Status updated successfully.");
                    } else {
                        throw new Error(result.error || 'Unknown error');
                    }
                })
                .catch(error => {
                    // Re-enable button and show error
                    alert('Error updating status: ' + error.message);
                })
                .finally(() => {
                    btn.prop('disabled', false);
                });
            });
        }
    };
});