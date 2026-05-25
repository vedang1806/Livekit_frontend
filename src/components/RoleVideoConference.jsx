/**
 * RoleVideoConference.jsx — video UI with role columns and labeled tiles.
 */

import { useEffect, useRef, useState } from 'react';
import {
  CarouselLayout,
  ConnectionStateToast,
  ControlBar,
  FocusLayoutContainer,
  LayoutContextProvider,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
  isTrackReference,
} from '@livekit/components-react';
import { isWeb, log, isEqualTrackRef } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import RoleColumnsLayout from './RoleColumnsLayout';
import RoleParticipantTile from './RoleParticipantTile';

export default function RoleVideoConference(props) {
  const [, setWidgetState] = useState({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusedScreenShareTrack = useRef(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter(track => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter(track => !isEqualTrackRef(track, focusTrack));

  useEffect(() => {
    if (
      screenShareTracks.some(track => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
      layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        track =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      log.debug('Auto clearing screen share focus.');
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        tr =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source,
      );
      if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
      }
    }
  }, [
    screenShareTracks
      .map(ref => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    focusTrack?.publication?.trackSid,
    tracks,
    layoutContext.pin,
  ]);

  if (!isWeb()) return null;

  return (
    <div className="lk-video-conference role-video-conference" {...props}>
      <LayoutContextProvider value={layoutContext} onWidgetChange={setWidgetState}>
        <div className="lk-video-conference-inner">
          {!focusTrack ? (
            <RoleColumnsLayout tracks={tracks} />
          ) : (
            <div className="lk-focus-layout-wrapper">
              <FocusLayoutContainer>
                <CarouselLayout tracks={carouselTracks}>
                  <RoleParticipantTile />
                </CarouselLayout>
                {focusTrack && (
                  <RoleParticipantTile trackRef={focusTrack} className="role-focus-tile" />
                )}
              </FocusLayoutContainer>
            </div>
          )}
          <ControlBar controls={{ chat: true, settings: false }} />
        </div>
      </LayoutContextProvider>
      <ConnectionStateToast />
    </div>
  );
}
