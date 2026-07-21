<?php
// local/securecoursehub/index.php
require_once(__DIR__ . '/../../config.php');
require_once(__DIR__ . '/classes/local/request_service.php');

$courseid = required_param('courseid', PARAM_INT);
$course = get_course($courseid);

// Enforce authentication
require_login($course);

$context = context_course::instance($courseid);

// Check base capability to view the plugin
require_capability('local/securecoursehub:viewown', $context);

$PAGE->set_url(new moodle_url('/local/securecoursehub/index.php', ['courseid' => $courseid]));
$PAGE->set_context($context);
$PAGE->set_title(get_string('pluginname', 'local_securecoursehub'));
$PAGE->set_heading(format_string($course->fullname));

$action = optional_param('action', '', PARAM_ALPHANUMEXT);
$service = new \local_securecoursehub\local\request_service();

if ($action === 'create' && data_submitted() && confirm_sesskey()) {
    require_capability('local/securecoursehub:createrequest', $context);
    $title = required_param('title', PARAM_TEXT);
    $description = required_param('description', PARAM_TEXT);
    
    $service->create_request($courseid, $USER->id, $title, $description);
    redirect($PAGE->url);
}

if ($action === 'delete' && data_submitted() && confirm_sesskey()) {
    $requestid = required_param('requestid', PARAM_INT);
    $service->delete_request($requestid, $USER->id, $context);
    redirect($PAGE->url);
}

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('pluginname', 'local_securecoursehub'));

$is_teacher = has_capability('local/securecoursehub:managecourserequests', $context);

// Include JS module for AJAX
$PAGE->requires->js_call_amd('local_securecoursehub/dashboard', 'init', [$courseid]);


if ($is_teacher) {
    echo $OUTPUT->heading(get_string('courserequests', 'local_securecoursehub'), 3);
    $requests = $service->get_course_requests($courseid);
    
    if (empty($requests)) {
        echo html_writer::tag('p', 'No requests found for this course.');
    } else {
        $table = new html_table();
        $table->head = ['ID', 'Student ID', 'Title', 'Status', 'Actions'];
        foreach ($requests as $req) {
            $row = [];
            $row[] = $req->id;
            $row[] = $req->userid;
            $row[] = s($req->title); // Safe output
            $row[] = html_writer::tag('span', s($req->status), ['id' => 'status-' . $req->id]);
            
            // AJAX controls for teacher
            $select = html_writer::select(
                ['open' => 'Open', 'inprogress' => 'In Progress', 'resolved' => 'Resolved'],
                'status_select_' . $req->id,
                $req->status,
                false,
                ['id' => 'select-' . $req->id]
            );
            $btn = html_writer::tag('button', 'Update', [
                'class' => 'update-status-btn',
                'data-requestid' => $req->id
            ]);
            
            $row[] = $select . ' ' . $btn;
            $table->data[] = $row;
        }
        echo html_writer::table($table);
    }
} else {
    if (has_capability('local/securecoursehub:createrequest', $context)) {
        echo $OUTPUT->heading(get_string('createrequest', 'local_securecoursehub'), 3);
        ?>
        <form method="post" action="index.php">
            <input type="hidden" name="courseid" value="<?php echo $courseid; ?>">
            <input type="hidden" name="action" value="create">
            <input type="hidden" name="sesskey" value="<?php echo sesskey(); ?>">
            <div>
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required maxlength="255">
            </div>
            <div>
                <label for="description">Description:</label>
                <textarea id="description" name="description" required></textarea>
            </div>
            <button type="submit"><?php echo get_string('submit', 'local_securecoursehub'); ?></button>
        </form>
        <?php
    }

    echo $OUTPUT->heading(get_string('myrequests', 'local_securecoursehub'), 3);
    $requests = $service->get_user_requests($courseid, $USER->id);
    
    if (empty($requests)) {
        echo html_writer::tag('p', 'You have no requests in this course.');
    } else {
        $table = new html_table();
        $table->head = ['ID', 'Title', 'Status', 'Actions'];
        foreach ($requests as $req) {
            $row = [];
            $row[] = $req->id;
            $row[] = s($req->title);
            $row[] = s($req->status);
            
            $actions = '';
            if ($req->status === 'open') {
                $del_form = html_writer::start_tag('form', ['method' => 'post', 'action' => 'index.php', 'style' => 'display:inline;']) .
                            html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'courseid', 'value' => $courseid]) .
                            html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'action', 'value' => 'delete']) .
                            html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'requestid', 'value' => $req->id]) .
                            html_writer::empty_tag('input', ['type' => 'hidden', 'name' => 'sesskey', 'value' => sesskey()]) .
                            html_writer::tag('button', get_string('deleterequest', 'local_securecoursehub'), ['type' => 'submit']) .
                            html_writer::end_tag('form');
                $actions = $del_form;
            }
            $row[] = $actions;
            $table->data[] = $row;
        }
        echo html_writer::table($table);
    }
}

echo $OUTPUT->footer();