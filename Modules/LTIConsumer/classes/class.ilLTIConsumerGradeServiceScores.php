<?php

declare(strict_types=1);

/**
 * This file is part of ILIAS, a powerful learning management system
 * published by ILIAS open source e-Learning e.V.
 *
 * ILIAS is licensed with the GPL-3.0,
 * see https://www.gnu.org/licenses/gpl-3.0.en.html
 * You should have received a copy of said license along with the
 * source code, too.
 *
 * If this is not the case or you just want to try ILIAS, you'll find
 * us at:
 * https://www.ilias.de
 * https://github.com/ILIAS-eLearning
 *
 *********************************************************************/

/**
 * Class ilLTIConsumerGradeServiceScores
 *
 * @author      Uwe Kohnle <kohnle@internetlehrer-gmbh.de>
 * @author      Stefan Schneider <info@eqsoft.de>
 *
 * @package     Module/LTIConsumer
 */

class ilLTIConsumerGradeServiceScores extends ilLTIConsumerResourceBase
{
    public function __construct(ilLTIConsumerServiceBase $service) {
        parent::__construct($service);
        $this->id = 'Score.collection';
        $this->template = '/{context_id}/lineitems/{item_id}/lineitem/scores';
        $this->variables[] = 'Scores.url';
        $this->formats[] = 'application/vnd.ims.lis.v1.scorecontainer+json';
        $this->formats[] = 'application/vnd.ims.lis.v1.score+json';
        $this->methods[] = 'POST';
    }

    /**
     * Execute the request for this resource.
     */
    public function execute(ilLTIConsumerServiceResponse $response): void {
        $params = $this->parseTemplate();
        $contextId = $params['context_id'];
        $itemId = $params['item_id'];

        ilObjLTIConsumer::getLogger()->debug("contextId: " . $contextId);
        ilObjLTIConsumer::getLogger()->debug("objId: " . $itemId);
        ilObjLTIConsumer::getLogger()->debug("request data: " . $response->getRequestData());

        // GET is disabled by the moment, but we have the code ready
        // for a future implementation.

        //$container = empty($contentType) || ($contentType === $this->formats[0]);

        $typeid = 0;

        $scope = ilLTIConsumerGradeService::SCOPE_GRADESERVICE_SCORE;
        try {
            $token = $this->checkTool(array($scope));
            if (is_null($token)) {
                throw new Exception('invalid request', 401);
            }
            // Bug in Moodle as tool provider, should accept only "204 No Content" but schedules grade sync task will notices a failed status if not exactly 200
            // see: http://www.imsglobal.org/spec/lti-ags/v2p0#score-service-scope-and-allowed-http-methods
            //$response->setCode(204); // correct
            $response->setCode(200); // not really correct
        } catch (Exception $e) {
            $response->setCode($e->getCode());
            $response->setReason($e->getMessage());
        }
    }
}
