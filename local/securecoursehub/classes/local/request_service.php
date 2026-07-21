<?php
namespace local_securecoursehub\local;

defined('MOODLE_INTERNAL') || die();

class request_service {
    
    public function create_request($courseid, $userid, $title, $description) {
        global $DB;
        
        $record = new \stdClass();
        $record->courseid = $courseid;
        $record->userid = $userid;
        $record->title = $title;
        $record->description = $description;
        $record->status = 'open';
        $record->timecreated = time();
        $record->timemodified = time();
        
        return $DB->insert_record('local_securecoursehub_req', $record);
    }
    
    public function get_user_requests($courseid, $userid) {
        global $DB;
        return $DB->get_records('local_securecoursehub_req', ['courseid' => $courseid, 'userid' => $userid], 'timecreated DESC');
    }
    
    public function get_course_requests($courseid) {
        global $DB;
        return $DB->get_records('local_securecoursehub_req', ['courseid' => $courseid], 'timecreated DESC');
    }
    
    public function delete_request($requestid, $userid, $context) {
        global $DB;
        
        $record = $DB->get_record('local_securecoursehub_req', ['id' => $requestid], '*', MUST_EXIST);
        
        // Ownership check: Only owner can delete, or a manager
        if ((int)$record->userid !== (int)$userid && !has_capability('local/securecoursehub:managecourserequests', $context)) {
            throw new \required_capability_exception($context, 'local/securecoursehub:managecourserequests', 'nopermissions', '');
        }
        
        // State check: Cannot delete resolved requests if student
        if ($record->status === 'resolved' && !has_capability('local/securecoursehub:managecourserequests', $context)) {
            throw new \moodle_exception('Cannot delete resolved requests.');
        }
        
        $DB->delete_records('local_securecoursehub_req', ['id' => $requestid]);
    }
    
    public function update_status($requestid, $newstatus, $context) {
        global $DB;
        
        $allowed_statuses = ['open', 'inprogress', 'resolved'];
        if (!in_array($newstatus, $allowed_statuses)) {
            throw new \moodle_exception('invalidstatus', 'local_securecoursehub');
        }
        
        $record = $DB->get_record('local_securecoursehub_req', ['id' => $requestid], '*', MUST_EXIST);
        
        // Authorization: Must have manage capability in the course context
        if (!has_capability('local/securecoursehub:managecourserequests', $context)) {
            throw new \required_capability_exception($context, 'local/securecoursehub:managecourserequests', 'nopermissions', '');
        }
        
        $record->status = $newstatus;
        $record->timemodified = time();
        $DB->update_record('local_securecoursehub_req', $record);
        
        return true;
    }
}