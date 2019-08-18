<?php namespace LTI\Screen;

use ILIAS\GlobalScreen\Scope\Layout\Provider\AbstractModificationProvider;
use ILIAS\GlobalScreen\Scope\Layout\Provider\ModificationProvider;
use ILIAS\GlobalScreen\Scope\Layout\Factory\MetaBarModification;
use ILIAS\GlobalScreen\ScreenContext\Stack\CalledContexts;
use ILIAS\GlobalScreen\ScreenContext\Stack\ContextCollection;
use ILIAS\UI\Component\MainControls\MetaBar;
use ILIAS\UI\Component\Button\Bulky;

/**
 * Class LtiViewLayoutProvider
 *
 * @author Stefan Schneider <schneider@hrz.uni-marburg.de>
 */
class LtiViewLayoutProvider extends AbstractModificationProvider implements ModificationProvider
{

    /**
     * @inheritDoc
     */
     
    public function isInterestedInContexts() : ContextCollection
    {
        return $this->context_collection->lti();
    }
    
    /**
     * @inheritDoc
     */
    public function getMetaBarModification(CalledContexts $screen_context_stack) : ?MetaBarModification
    {
        if ($this->dic["lti"]->isActive()) {
            return $this->globalScreen()
                ->layout()
                ->factory()
                ->metabar()
                ->withModification(function (MetaBar $current) : MetaBar {
                $f = $this->dic->ui()->factory();
                $exit_symbol = $f->symbol()->glyph()->remove();
                $exit = $f->button()->bulky($exit_symbol,"exit",$this->dic["lti"]->getCmdLink('exit'));
                $metabar = $f->mainControls()->metaBar()->withAdditionalEntry('exit', $exit);
                return $metabar;
            })->withHighPriority();
        }
        else {
            return null;
        }
    }
}